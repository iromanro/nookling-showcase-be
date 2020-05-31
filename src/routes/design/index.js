const express = require('express');
const controller = require('./controller');
const authenticate = require('../../middlewear/authenticate');

const router = express.Router();

router.post('/', authenticate, controller.createDesign);
router.post('/:uuid/like', authenticate, controller.likeDesign);
router.put('/:uuid/item', authenticate, controller.addItem);
router.put('/:uuid/item/remove', authenticate, controller.removeItem);
router.get('/:uuid', controller.getDesign);
router.delete('/:uuid', authenticate, controller.deleteDesign);
router.get('/:uuid/edit', authenticate, controller.getDesignEdit);
router.put('/:uuid/edit', authenticate, controller.updateDesign);

module.exports = router;
