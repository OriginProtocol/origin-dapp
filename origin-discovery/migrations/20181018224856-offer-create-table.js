'use strict';

const TableName = 'offer'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      // Offer ID format is: <listingId>-<offerIndex>
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true
      },
      listing_id: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      seller_address: {
        type: Sequelize.CHAR(42),
        allowNull: false
      },
      buyer_address: {
        type: Sequelize.CHAR(42),
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(TableName, ['listing_id']))
      .then(() => queryInterface.addIndex(TableName, ['seller_address']))
      .then(() => queryInterface.addIndex(TableName, ['buyer_address']))

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TableName)
  }
}