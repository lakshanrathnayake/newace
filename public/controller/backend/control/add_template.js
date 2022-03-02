$(document).ready(function () {
    /**
     * field repeat control panel
     */
    $('.repeat-action').click(function () {
        let newRow = $($(this).parents('.repeat-panel').find('.repeat-row').last().wrap('<p/>').parent().html());
        newRow.find('.close-repeat').click(function () {
            $(this).parents('.repeat-row').remove();
        });
        $(this).parents('.repeat-panel').find('.repeat-content').append(newRow);
    });

    $('.repeat-action2').click(function () {
        let newRow = $($(this).parents('.repeat-panel').find('.dummy').first().html());
        newRow.find('.close-repeat2').click(function () {
            $(this).parents('.repeat-row').find('.re-col').last().remove();
        });
        newRow.find('.repeat-action3').click(function () {
            let colRow = $($(this).parents('.repeat-row').find('.re-col2').last().html());
            $(this).parents('.repeat-row').find('.re-col').append(colRow)
        });
        newRow.find('.close-repeat3').click(function () {
            $(this).parents('.repeat-row').remove();
        });

        $(this).parents('.repeat-panel').find('.repeat-content').append(newRow);
    });

    $('.repeat-action3').click(function () {
        let colRow = $($(this).parents('.repeat-row').find('.re-col2').last().html());
        $(this).parents('.repeat-row').find('.re-col').append(colRow)
    });

// var detailTable = null;

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