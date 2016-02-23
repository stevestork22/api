require('./location');

const uuid = require('node-uuid');
const bookshelf = require('../../config').bookshelf;

const Trial = bookshelf.Model.extend({
  tableName: 'trials',
  visible: [
    'id',
    'public_title',
    'brief_summary',
    'registration_date',
    'locations',
  ],
  serialize: function(options) {
    const attributes = this.attributes;
    const relations = this.relations;

    let locations = [];
    if (relations.locations) {
      locations = relations.locations.map((loc) => {
        const locAttributes = loc.toJSON();
        const role = locAttributes._pivot_role;
        delete locAttributes._pivot_role;

        return {
          role: loc.pivot.attributes.role,
          'location': locAttributes,
        };
      });
    }
    attributes.locations = locations;

    return attributes;
  },
  initialize: function () {
    this.on('saving', this.addIdIfNeeded);
  },
  addIdIfNeeded: (model) => {
    if (!model.attributes.id) {
      model.attributes.id = uuid.v1();
    }
  },
  locations: function () {
    return this.belongsToMany('Location', 'trials_locations',
      'trial_id', 'location_id').withPivot(['role']);
  },
});

module.exports = bookshelf.model('Trial', Trial);
