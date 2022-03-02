var Base = require('./base');
/**
 * User related queries
 * @param db
 * @constructor
 */
function Supplier(db) {
    // inheritance management
    this.__proto__ = new Base('supplier', db);

    /**
     * add supplier to db
     * @param supplier
     * @param callback
     */
    this.addSupplier = function (supplier, callback) {
        supplier.create(supplier).then(function (returnModel) {
            callback(returnModel.get({plain: true}));
        });
    };

    /**
     * search by supplier name
     * @param supplier
     * @param callback
     */
    this.searchByName = function (supplier, callback) {
        supplier.findAll({
            where: {
                deletedAt: {
                    [Op.ne]: null
                }
            }
        });
    }

    /**
     * update supplier
     * @param supplier
     * @param callback
     */
    this.updateSupplier= function (supplier, callback) {
        supplier.update(supplier, {where: {id: supplier.id}}).then(function (returnModel) {
            callback(returnModel);
        });

    }


    /**
     * delete supplier query
     * @param supplier
     * @param callback
     */
    this.deleteSupplier   =  function (supplier,callback) {
        supplier.update(supplier, {where: {id: supplier.id}}).then(function (returnModel) {
            callback(returnModel);
        });
    }

    /**
     * get all suppliers
     * @param branch
     * @param callback
     */
    this.getAllSuppliers = function (supplier, callback) {
        supplier.findAll({where: {state: 1}}).then(supplierResult => {
            callback(supplierResult);
        });
    }
        // returning the object
        return this;
    }
    module.exports = Supplier;