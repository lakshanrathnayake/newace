$(document).ready(function () {
    /**
     * field repeat control panel
     */

    function readURL(input) {

        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {

                $('#img_preview').attr('src', e.target.result);
                $('#product_image').attr('src', e.target.result);
        
                let imageValues  = {
                    image_name:input.files[0].name
                }


                // $('#base').val(e.target.result);

                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    let filesToUploads = document.getElementById('product_image').files;
                    let file = filesToUploads[0];
                    if (file) {

                        let reader = new FileReader();
                        // Set the image once loaded into file reader
                        reader.onload = function(e) {

                            let img = document.createElement("img");
                            img.src = e.target.result;

                            let canvas = document.createElement("canvas");
                            var ctx = canvas.getContext("2d");
                            ctx.drawImage(img, 0, 0);

                            let MAX_WIDTH = 200;
                            let MAX_HEIGHT = 200;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            var ctx = canvas.getContext("2d");
                            ctx.drawImage(img, 0, 0, width, height);

                            dataurl = canvas.toDataURL(file.type);
                            $('#image_k').val(imageValues.image_name);
                     
                            $('#base').val(dataurl);

                        }
                        reader.readAsDataURL(file);


                    }

                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $("#product_image").change(function () {
        readURL(this);
    });

    //
    //     $('#imageFile').change(function(evt) {
    //
    //         var files = evt.target.files;
    //         var file = files[0];
    //
    //         if (file) {
    //             var reader = new FileReader();
    //             reader.onload = function(e) {
    //                 document.getElementById('base').src = e.target.result;
    //             };
    //             reader.readAsDataURL(file);
    //         }
    //     });
    //








    $('.repeat-action').click(function () {
        let newRow = $($(this).parents('.repeat-panel').find('.repeat-row').last().wrap('<p/>').parent().html());
        newRow.find('.close-repeat').click(function () {
            $(this).parents('.repeat-row').remove();
        });
        $(this).parents('.repeat-panel').find('.repeat-content').append(newRow);
    });

    $('.repeat-action2').click(function () {
        //alert('ferr');
        //var newRow = $($(this).parents('.repeat-panel').find('.dummy').first().html());
        let newRow = ($(this).parents('.repeat-panel').find('.repeat-row').first()).clone();
        //newRow.find('.close-repeat2').click(function () {
        //    $(this).parents('.repeat-row').find('.re-col').last().remove();
        //});
        //newRow.find('.repeat-action3').click(function () {
        //    var colRow = $($(this).parents('.repeat-row').find('.re-col2').last().html());
        //    $(this).parents('.repeat-row').find('.re-col').append(colRow)
        //});
        newRow.find('.close-repeat3').click(function () {
            $(this).parents('.repeat-row').remove();
        });
        newRow.find('.js-example-basic-multiple').select2();
        //console.log(newRow.find('.elect2, .select2-container, .select2-container--default').last());
        newRow.find('.elect2, .select2-container, .select2-container--default').last().remove();
        $(this).parents('.repeat-panel').find('.repeat-content').append(newRow);

    });

    $('.repeat-action3').click(function () {
        let colRow = $($(this).parents('.repeat-row').find('.re-col2').last().html());
        $(this).parents('.repeat-row').find('.re-col').append(colRow)
    });
    let id = 0;
// var detailTable = null;
    $("#add").click(function (event) {
        id = 0;

        event.preventDefault();
        let formData = $('#main_form').serializeArray();
        //console.log(formData);
        let groupData = groupFormInputs(formData);
        //console.log(groupData);
        let parrameters = groupFormInputs(formData)['parameter[]'];
        let values = groupFormInputs(formData)['states[]'];
        //var values = groupFormInputs(formData)['value[]'];
        values = values.filter(function (val) {
            return (val != null && val != "");
        });
        let objArray = {};
        let j = 0;
        let valArray = [];
        for (let i = 0; i < values.length; i++) {
            if (values[i] != 'DIV') {
                valArray.push(values[i]);
            }
            else {
                objArray[parrameters[j]] = valArray;
                valArray = [];
                j++;

            }
        }

        let taxTypes = groupData['tax_type[]'];
        let taxVals = {};
        let taxes = 0;
        for (let t = 0; t < groupData['tax_amount[]'].length; t++) {
            taxVals[taxTypes[t]] = parseInt(groupData['tax_amount[]'][t]);
            taxes += (groupData['tax_amount[]'][t] && groupData['tax_amount[]'][t] != "") ? parseInt(groupData['tax_amount[]'][t]) : 0;
        }
        $('#taxUP').val(JSON.stringify(taxVals));
        let cost = (groupData.mf_price[0] != "") ? parseInt(groupData.mf_price[0]) + (parseInt(groupData.mf_price) * (taxes / 100)) : 0;
        let keys = Object.keys(objArray);


        let combinationArray = [];
        for (let i = 0; i < keys.length; i++) {
            let name = keys[i];
            let values = objArray[name];
            if (name != null && name != "") {
                combinationArray.push(values.map(function (x) {
                    return x.replace(x[0], name + '-' + x[0])
                }));
            }

        }
        createTable(combinationArray, keys, groupData, cost)
    });


    function createTable(compArray, keys, groupData, cost) {
        let detailTable = $('#productTable').DataTable();
        detailTable.clear().draw();
        combinations(compArray, log);
        function log(message) {
            if (typeof console == "object") {
                let matches = message.filter(s => s.includes('Size-'));
                let size = (matches.length > 0)?matches[0].split('Size-')[1]:0;
                if(size != 0){
                    size = size.split('?')[0]
                }

                let name = message.join('-');
                let strRe = JSON.parse(JSON.stringify(message));
                for (var k= 0; k<strRe.length;k++){
                    strRe[k] = strRe[k].split('?')[1];
                }
                let str2 = strRe.join('-');
                //var str = message.join('-');
                //for (var j = 0; j < keys.length; j++) {
                //    if (keys[j] != "") {
                //        str = str.replace(keys[j] + '-', '');
                //        str = str.replace(keys[j] + '-', '');
                //    }
                //}
                let ele = generateRowElements(id, groupData, str2);

                //var bar = groupData.mfpno[0] + str;

                //str = (str.split('?')).join('');
                //alert(str);
                let barcode = '<input required readonly title="' + groupData.dsgno[0] + '' + size + '' +'" class="form-control" placeholder="value" name="barcode[' + id + ']" value="' + groupData.dsgno[0] + '' + size + '' +'">';
                let namecode = '<input required readonly title=" '+ groupData.dsgno[0] + '-' + groupData.description[0] + '-' + str2 + '" class="form-control" placeholder="value" name="name[' + id + ']" value="' + groupData.dsgno[0] + '-' + groupData.description[0] + '-' + str2 + '">';


                let cose = '<input required class="form-control"  name="cost[' + id + ']" value="' + cost + '">';
                detailTable.row.add([ele.mfno, barcode, namecode, ele.description, ele.category,ele.categoryName,
                    ele.mf_price, cose, ele.selling_price, ele.min_quantity, ele.reorder_level, ele.action]).draw(false);
                id++;
            }
        }
    }

    function generateRowElements(i, groupData, str) {

        let options = $('#suggestion2').html();
        return {
            mfno: '<input required title="' + groupData.dsgno[0] + str + '" class="form-control" placeholder="value" name="mfno[' + i + ']" value="' + groupData.dsgno[0]+'">',
            description: '<input required title="' + groupData.description[0] + '" class="form-control" placeholder="value" name="description[' + i + ']" value="' + groupData.description[0] + '">',
            category: '<input  required class="form-control" placeholder="value" readonly name="category[' + i + ']" value="' + groupData.category[0].split('?')[0] + '">',
            categoryName: '<input  required !important;" class="form-control" title="' + groupData.category[0].split('?')[1] + '" placeholder="value" readonly name="categoryName[' + i + ']" value="' + groupData.category[0].split('?')[1] + '">',
            mf_price: '<input required class="form-control" placeholder="value" name="mf_price[' + i + ']" value="' + groupData.mf_price[0] + '">',
            selling_price: '<input required class="form-control" placeholder="value" name="selling_price[' + i + ']" value="' + groupData.selling_price[0] + '">',
            min_quantity: '<input required class="form-control" placeholder="value" name="min_quantity[' + i + ']" value="' + groupData.min_quantity[0] + '">',
            reorder_level: '<input required class="form-control" placeholder="value" name="reorder_level[' + i + ']" value="' + groupData.reorder_level[0] + '">',
            action: '<button required STYLE="width: 60% !important;" class="form-control btn btn-danger btn-xs remove-row"><span class="fa fa-trash"></span></button>'

        }
    };

    $('#productTable tbody').on('click', 'td .remove-row', function () {
        let row = $('#productTable').DataTable().row($(this).parents('tr'));
        row.remove().draw(false);
    });

    function combinations(choices, callback, prefix) {
        if (!choices.length) {

            return callback(prefix);
        }
        for (let c = 0; c < choices[0].length; c++) {
            combinations(choices.slice(1), callback, (prefix || []).concat(choices[0][c]));
        }
    }

    /**
     * group form inputs
     * @param formData
     * @returns {{}}
     */
    function groupFormInputs(formData) {
        let formDataGrouped = {};
        formData.forEach(function (entry) {
            if (typeof formDataGrouped[entry.name] == 'undefined') {
                formDataGrouped[entry.name] = [];
            }
            formDataGrouped[entry.name].push(entry.value);
        });

        return formDataGrouped;
    }

    /**
     *
     * @param perparingForm
     * @param groupedFormInputs
     * @param inputsToCopy
     */
    function generateRow(perparingForm, groupedFormInputs, inputsToCopy) {
        let rowList = [], prevValue = '', changedFlag = 0, parameterCategories = {};
        groupedFormInputs['parameter[]'].forEach(function (parameter) {
            prevValue = '';
            changedFlag = 0;
            groupedFormInputs['value[]'].forEach(function (value) {
                if (changedFlag == 0) {
                    if (typeof parameterCategories[parameter] == 'undefined') {
                        parameterCategories[parameter] = [];
                    }
                    parameterCategories[parameter].push(value);
                }
                if (prevValue != '' && prevValue != value)
                    changedFlag = 1;
                prevValue = value;
            });
        });
    }

});
