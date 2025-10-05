const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const { auth, checkRole } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');
const { uploadImages, processImages } = require('../middleware/upload');
const { runAIMatching } = require('../ai-vision/inference');

// Report a lost item
router.post('/lost-items', auth, validateInput, uploadImages, async (req, res) => {
  try {
    const lostItemData = {
      ...req.body,
      reportedBy: req.user._id,
      images: req.uploadedImages || []
    };

    const lostItem = new LostItem(lostItemData);
    await lostItem.save();

    // Process images with AI if uploaded
    if (req.uploadedImages && req.uploadedImages.length > 0) {
      try {
        const aiFeatures = await processImages(req.uploadedImages);
        await lostItem.updateAIFeatures(aiFeatures);
        
        // Trigger AI matching
        setTimeout(() => runAIMatching(lostItem._id), 1000);
      } catch (aiError) {
        console.error('AI processing failed:', aiError);
      }
    }

    await lostItem.populate('reportedBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      data: lostItem,
      message: 'Lost item reported successfully'
    });

  } catch (error) {
    console.error('Error creating lost item:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to report lost item'
    });
  }
});

// Report a found item
router.post('/found-items', auth, checkRole(['staff', 'admin']), validateInput, uploadImages, async (req, res) => {
  try {
    const foundItemData = {
      ...req.body,
      reportedBy: req.user._id,
      staffMember: req.user._id,
      images: req.uploadedImages || []
    };

    const foundItem = new FoundItem(foundItemData);
    await foundItem.save();

    // Process images with AI if uploaded
    if (req.uploadedImages && req.uploadedImages.length > 0) {
      try {
        const aiFeatures = await processImages(req.uploadedImages);
        await foundItem.updateAIFeatures(aiFeatures);
        
        // Trigger AI matching
        setTimeout(() => runAIMatching(null, foundItem._id), 1000);
      } catch (aiError) {
        console.error('AI processing failed:', aiError);
      }
    }

    await foundItem.populate([
      { path: 'reportedBy', select: 'firstName lastName email' },
      { path: 'staffMember', select: 'firstName lastName' }
    ]);
    
    res.status(201).json({
      success: true,
      data: foundItem,
      message: 'Found item reported successfully'
    });

  } catch (error) {
    console.error('Error creating found item:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to report found item'
    });
  }
});

// Get user's lost items
router.get('/lost-items/my', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { reportedBy: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const lostItems = await LostItem.find(query)
      .populate('matches.foundItemId', 'description images location status')
      .sort({ dateReported: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LostItem.countDocuments(query);

    res.json({
      success: true,
      data: lostItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching lost items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lost items'
    });
  }
});

// Get all lost items (staff/admin)
router.get('/lost-items', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const { 
      status, 
      itemType, 
      location, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (itemType) query.itemType = itemType;
    if (location) {
      query['location.lastSeen'] = new RegExp(location, 'i');
    }
    if (dateFrom || dateTo) {
      query.dateReported = {};
      if (dateFrom) query.dateReported.$gte = new Date(dateFrom);
      if (dateTo) query.dateReported.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { 'color.primary': new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const lostItems = await LostItem.find(query)
      .populate('reportedBy', 'firstName lastName email phone')
      .populate('matches.foundItemId', 'description images location status')
      .sort({ dateReported: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LostItem.countDocuments(query);

    res.json({
      success: true,
      data: lostItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching lost items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lost items'
    });
  }
});

// Get all found items (staff/admin)
router.get('/found-items', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const { 
      status, 
      itemType, 
      location, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 20,
      search,
      storageLocation
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (itemType) query.itemType = itemType;
    if (location) {
      query.$or = [
        { 'location.foundAt': new RegExp(location, 'i') },
        { 'location.currentLocation': new RegExp(location, 'i') }
      ];
    }
    if (storageLocation) {
      query['storage.shelfLocation'] = new RegExp(storageLocation, 'i');
    }
    if (dateFrom || dateTo) {
      query.dateFound = {};
      if (dateFrom) query.dateFound.$gte = new Date(dateFrom);
      if (dateTo) query.dateFound.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { 'color.primary': new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const foundItems = await FoundItem.find(query)
      .populate('reportedBy', 'firstName lastName email')
      .populate('staffMember', 'firstName lastName')
      .populate('claimProcess.claimedBy', 'firstName lastName email phone')
      .populate('matches.lostItemId', 'description reportedBy')
      .sort({ dateFound: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoundItem.countDocuments(query);

    res.json({
      success: true,
      data: foundItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching found items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch found items'
    });
  }
});

// Get specific lost item
router.get('/lost-items/:id', auth, async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName email phone')
      .populate('matches.foundItemId');

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }

    // Check access rights
    const isOwner = lostItem.reportedBy._id.toString() === req.user._id.toString();
    const isStaff = ['staff', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: lostItem
    });

  } catch (error) {
    console.error('Error fetching lost item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lost item'
    });
  }
});

// Get specific found item
router.get('/found-items/:id', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName email')
      .populate('staffMember', 'firstName lastName')
      .populate('claimProcess.claimedBy', 'firstName lastName email phone')
      .populate('claimProcess.approvedBy', 'firstName lastName')
      .populate('matches.lostItemId')
      .populate('notes.addedBy', 'firstName lastName')
      .populate('auditLog.performedBy', 'firstName lastName');

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    res.json({
      success: true,
      data: foundItem
    });

  } catch (error) {
    console.error('Error fetching found item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch found item'
    });
  }
});

// Initiate claim for found item
router.post('/found-items/:id/claim', auth, async (req, res) => {
  try {
    const { verificationAnswers } = req.body;
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    if (foundItem.status !== 'stored') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for claiming'
      });
    }

    // Process verification questions
    const verificationQuestions = verificationAnswers || [];
    
    await foundItem.initiateClaim(req.user._id, verificationQuestions);

    res.json({
      success: true,
      data: foundItem,
      message: 'Claim initiated successfully. Please wait for staff approval.'
    });

  } catch (error) {
    console.error('Error initiating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate claim'
    });
  }
});

// Approve/reject claim (staff only)
router.patch('/found-items/:id/claim/:action', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const { id, action } = req.params;
    const { verificationScore, reason } = req.body;

    const foundItem = await FoundItem.findById(id);
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    if (!foundItem.claimProcess.claimedBy) {
      return res.status(400).json({
        success: false,
        message: 'No active claim to process'
      });
    }

    if (action === 'approve') {
      await foundItem.approveClaim(req.user._id, verificationScore);
      res.json({
        success: true,
        data: foundItem,
        message: 'Claim approved successfully'
      });
    } else if (action === 'reject') {
      foundItem.claimProcess = undefined;
      foundItem.status = 'stored';
      foundItem.addAuditEntry('claim_rejected', req.user._id, reason || 'Claim rejected');
      await foundItem.save();
      
      res.json({
        success: true,
        data: foundItem,
        message: 'Claim rejected'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

  } catch (error) {
    console.error('Error processing claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process claim'
    });
  }
});

// Complete item pickup
router.patch('/found-items/:id/pickup', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const { pickupCode } = req.body;
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    if (!foundItem.claimProcess.approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'Claim not approved yet'
      });
    }

    if (foundItem.claimProcess.pickupCode !== pickupCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup code'
      });
    }

    await foundItem.completeClaim(req.user._id);

    res.json({
      success: true,
      data: foundItem,
      message: 'Item pickup completed successfully'
    });

  } catch (error) {
    console.error('Error completing pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete pickup'
    });
  }
});

// Update storage location
router.patch('/found-items/:id/storage', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const { shelfLocation, bagNumber } = req.body;
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    await foundItem.updateStorageLocation(shelfLocation, bagNumber, req.user._id);

    res.json({
      success: true,
      data: foundItem,
      message: 'Storage location updated successfully'
    });

  } catch (error) {
    console.error('Error updating storage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update storage location'
    });
  }
});

// Add note to item
router.post('/found-items/:id/notes', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const { content, isPublic = false } = req.body;
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    await foundItem.addNote(content, req.user._id, isPublic);

    res.json({
      success: true,
      data: foundItem,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
});

// Get matching statistics
router.get('/statistics/matching', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const [lostStats, foundStats] = await Promise.all([
      LostItem.getStatistics(),
      FoundItem.getStorageStatistics()
    ]);

    const totalMatches = await LostItem.aggregate([
      { $unwind: '$matches' },
      { $group: { _id: '$matches.status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        lostItems: lostStats,
        foundItems: foundStats,
        matches: totalMatches
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Trigger AI matching manually
router.post('/matching/run-ai', auth, checkRole(['staff', 'admin']), async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    
    const result = await runAIMatching(lostItemId, foundItemId);
    
    res.json({
      success: true,
      data: result,
      message: 'AI matching completed successfully'
    });

  } catch (error) {
    console.error('Error running AI matching:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run AI matching'
    });
  }
});

module.exports = router;