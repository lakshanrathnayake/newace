/**
 * Created by tharindu on 2/5/2018.
 */

$(document).ready(function () {
    $('#orderGeneration').click(function () {
        location.href = routes.host+routes.manager.orderGeneration.index;
    });
    $('#storeList').click(function () {
        location.href = routes.host+routes.manager.storeListManager.index;
    });
    $('#addDamage').click(function () {
        location.href = routes.host+routes.manager.damageProduct.add;
    });
    $('#listDamage').click(function () {
        location.href = routes.host+routes.manager.damageProduct.list;
    });
    $('#addSupplier').click(function () {
        location.href= routes.host+routes.manager.addSupplier.index;
    });
    $('#supplierList').click(function () {
        //console.log("clicked");
         location.href=  routes.host+routes.manager.supplierList.index;
    });
});