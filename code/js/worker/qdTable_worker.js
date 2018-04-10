/**
 * Created by Administrator on 2017/11/17.
 */
//tr的html
const trHTML = '<tr class="_qd_trSize"></tr>';
//th复选框和序号的html
const thSelectIdHTML = '<th class="_qd_headColumn" name="dataAllSelect"><div class="_qd_checkBoxDiv"><input class="_qd_checkBox" type="checkbox"></div></th><th class="_qd_headColumn" name="dataItemIdName">序号</th>';
//th的html
const thHTML = '<th class="_qd_thSize" name="dataAttr" attrname="" showtip="false"></th>';
//table隐藏属性名称的html
// const thHideDivHTML = '<div class="_global_displayNone" name="dataAttr"></div>';
//td复选框和序号id的html;
const tdSelectIdHTML = '<td class="_qd_headColumn" name="dataItemSelect"><div class="_qd_checkBoxDiv"><input class="_qd_checkBox" type="checkbox"></div></td><td class="_qd_headColumn" name="dataItemId"></td>';
//td的html;
// const tdHTML = '<td class="_qd_tdSize" name="dataValue" attrname="" qdeditable="false"><p class="_qd_pSize" name="tdValue"></p><div class="_qd_divSize _global_displayNone" name="editBox"><textarea class="_qd_textAreaSize" cols="1"></textarea>' +
//     '<button class="_qd_btnSize _global_displayNone"><div class="_qd_downTriangle"></div></button></div></td>';
const tdHTML = '<td class="_qd_tdSize" name="dataValue" attrname="" qdeditable="false" showtip="false"></td>';

// const aloneSelectListHtml = '<ul class="_qd_ulSize _global_displayNone" name="qd"></ul>';
// const moreSelectListHTML = '<div class="_qd_moreSelectUlDivSize _global_displayNone"><ul class="_qd_moreSelectUlSize"></ul><div class="_qd_allSelectDivSize"><input class="_qd_moreSelectAllCBSize" type="checkbox"><p class="_global_clickThrough">全选</p></div>' +
//     '<div class="_qd_moreSelectBtnDivSize"><button class="_qd_moreSelectTrueBtnSize">确定</button><button class="_qd_moreSelectFalseBtnSize">取消</button></div></div></div>';
// const aloneSelectLiHTML = '<li class="_qd_liSize"></li>';
// const moreSelectLiHTML = '<li class="_qd_moreSelectLiSize"><input class="_qd_moreSelectCBSize" type="checkbox"><p class="_global_clickThrough"></p></li>';
//存储方法执行优先权
const methodPriority = {
    writeLinkData:2,
    rewriteTableTitle:2,
    setTableWidth:2,
    setTableLineHeight:2,
    showColumn:2,
    tableLabelRender:1,
    buttonRender:1,
    freezeLine:0
};

//存储复合数据
let compoundData;
//存储分割字符串长度标准
let cutNum = 100;

//存储表格循序
let tableColumnOrder;
//存储自定义表头中每列的宽度
let columnWidthArr = [];

//此处为接收函数
onmessage = function (event) {
    compoundData = event.data;
    handleDataConfig(compoundData);
    compoundData = null;
};

/**
 * 内部调用函数
 */

//判定字符串是否存在于数组中
function inArray(str,array) {
    if(!(array instanceof Array)){
        throw new Error('_this.inArray方法的array参数类型需为Array');
    }
    let returnIndex = -1;
    for(let index in array){
        if(!isNaN(index) && array[index] == str){
            returnIndex = index;
            break;
        }
    }
    for(let index in array){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
    return returnIndex;
}

//用于内部方法排序
function SortMethod(methodNameArr) {
    let shortTimeSave;
    let index = 0;
    while (index < methodNameArr.length){
        if(methodPriority[methodNameArr[index]] < methodPriority[methodNameArr[index + 1]]){
            shortTimeSave = methodPriority[methodNameArr[index]];
            methodPriority[methodNameArr[index]] = methodPriority[methodNameArr[index + 1]];
            methodPriority[methodNameArr[index + 1]] = shortTimeSave;
        }
        index += 1;
    }
    for(let index in arguments){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
}

//用于分割字符串长度
function htmlCutUp(domStr) {
    let trRule = /<tr((?!<\/tr>).)+<\/tr>/g;
    let nodeArr;
    let htmlStrItem = '';
    let returnArr = [];

    //获取所有的tr的htmlStr
    nodeArr = domStr.match(trRule);
    //将title的tr提取出来
    returnArr.push(nodeArr.shift());
    //根据分片段数量进行分割
    nodeArr.forEach(function (nodeHtml,index) {
        htmlStrItem += nodeHtml;
        if((index + 1) % cutNum == 0){
            returnArr.push(htmlStrItem);
            htmlStrItem = '';
        }
    });
    //将不够分片段数量且不为空的片段写入要返回的数组
    if(htmlStrItem != ''){
        returnArr.push(htmlStrItem);
    }
    domStr = null;
    return returnArr;
}

//用于提取自定义表头中各列的宽度集合
function diyTitleColumnWidthArr(diyTitleData,widthArr) {
    diyTitleData.forEach(function (dataItem) {
        //当width属性存在，则push进数组
        if(dataItem.width !== undefined){
            widthArr.push(parseInt(dataItem.width));
        }else {
            //width不存在时,children属性存在就重新调用，没有就push一个null进数组
            if(dataItem.children !== undefined){
                diyTitleColumnWidthArr(dataItem.children,widthArr);
            }else {
                widthArr.push(null);
            }
        }
    });
    diyTitleData = null;
    widthArr = null;
}

/**
 * 新增函数（内部）
 * 处理数据源+使用方法参数
 */
function handleDataConfig(compoundData) {
    let dataSource;
    let configData;
    let methodNameArr;
    let innerHTML;
    let itemStrArr;
    let _data;

    dataSource = compoundData.dataSource;
    configData = compoundData.configData;
    //设置每个片段中包含的行数
    if(configData.setPartRows !== undefined){
        cutNum = configData.setPartRows.partRows;
    }
    //获取自定义表头每列的宽度集合
    if(configData.rewriteTableTitle !== undefined && configData.rewriteTableTitle.diyTitleData !== undefined){
        diyTitleColumnWidthArr(configData.rewriteTableTitle.diyTitleData,columnWidthArr);
    }
    //设置了列的显示循序时，根据设置的数组进行补全；否则根据第一个数据的属性顺序进行排序
    if(configData.setColumnOrder !== undefined){
        tableColumnOrder = configData.setColumnOrder.columnOrder;
        Object.keys(dataSource[0]).forEach(function (attrName) {
            if(inArray(attrName,tableColumnOrder) < 0){
                tableColumnOrder.push(attrName);
            }
        });
    }else {
        tableColumnOrder = Object.keys(dataSource[0]);
    }
    methodNameArr = Object.keys(configData);
    innerHTML = dataToHTML(dataSource);
    itemStrArr = htmlCutUp(innerHTML);

    postMessage(parseInt(itemStrArr.length - 1));

    compoundData = null;
    //将方法名根据优先级排序
    SortMethod(methodNameArr);

    itemStrArr.forEach(function (itemStr) {
        if(methodNameArr.length > 0){
            methodNameArr.forEach(function (attr) {
                //获取对应的配置数据
                _data = configData[attr];
                //根据对应的属性名执行方法
                switch (attr){
                    // case 'writeLinkData':
                    //     if(_data instanceof Array){
                    //         _data.forEach(function (item) {
                    //             itemStr = addLinkDataToHtml(itemStr,item.attrName,item.dataSource,item.isMoreSelect);
                    //         })
                    //     }else {
                    //         itemStr = addLinkDataToHtml(itemStr,_data.attrName,_data.dataSource,_data.isMoreSelect);
                    //     }
                    //     break;
                    case 'rewriteTableTitle':
                        if(_data.diyTitleData === undefined){
                            itemStr = rewriteTableThHTML(itemStr,_data.dataSource);
                        }
                        break;
                    case 'setTableLineHeight':
                        itemStr = setTableLineHeightHTML(itemStr,_data.lineHeight);
                        break;
                    case 'showColumn':
                        itemStr = showColumn(itemStr,_data.attrNameArr);
                        break;
                    case 'tableLabelRender':
                        if(_data instanceof Array){
                            _data.forEach(function (item) {
                                itemStr = rewriteLabelToTdHTML(itemStr,item);
                            })
                        }else {
                            itemStr = rewriteLabelToTdHTML(itemStr,_data);
                        }
                        break;
                    case 'setEditColumn':
                        itemStr = setEditColumn(itemStr,_data.editNameArr);
                        break;
                    case 'showTableCheckBox':
                        itemStr = showTableHeadColumn('checkBox',itemStr,_data.isShow);
                        break;
                    case 'showTableNumber':
                        itemStr = showTableHeadColumn('number',itemStr,_data.isShow);
                        break;
                    default:
                        break;
                }
            })
        }
        postMessage(itemStr);
    });
    postMessage('over');
    dataSource = null;
    configData = null;
    methodNameArr = null;
    itemStrArr = null;
}

/**
 * 新增函数（内部）
 * 根据数据源生成HTML字符串
 */
function dataToHTML(dataSource) {
    //table表头
    let tableTitleHTML;
    //table表格内容
    let tableContentHTML = '';
    tableTitleHTML = create_th();
    dataSource.forEach(function (data,index) {
        tableContentHTML += create_td(data,index);
    });
    return tableTitleHTML + tableContentHTML;
}

/**
 * 新增函数（内部）
 * 用修改字符串的形式添加关联数组
 */
/*function addLinkDataToHtml(htmlStr,attrName,linkDataSource,isMoreSelect) {
    //存储要返回的字符串数据
    let returnHtmlStr = htmlStr;
    //匹配td[name="dataValue"]的字符串
    let tdRule = /<td[^>]+attrname=[^>]+>((?!<\/td>).)*<\/td>/g;
    //匹配attrname字符串
    let attrNameRule = /attrname=('|")[^'"]*('|")/;
    //匹配button字符串
    let btnRule = /<button[^>]+>/;
    //匹配class字符串
    let classRule = /class=('|")[^'"]+('|")/;
    //匹配list区域字符串
    let listRule = /<\/button>((?!<\/div><\/td>).)*<\/div><\/td>/;
    //存储列表html
    let listHTML;
    //存储li的html
    let liHTML;
    //存储li的字符串
    let liStr = '';
    //存储节点属性名
    let nodeAttrName;
    //回传的btnStr
    let returnBtnStr;
    //回传的tdStr;
    let returnTdStr;
    //存储关联数据
    let newDataObj = {};
    //配置参数
    newDataObj.attrName = attrName;
    newDataObj.dataSource = linkDataSource;
    newDataObj.isMoreSelect = isMoreSelect;

    //选择对应的liHtml
    liHTML = (isMoreSelect) ? moreSelectLiHTML : aloneSelectLiHTML;
    //根据关联数据进行list的修改
    linkDataSource.forEach(function (item) {
        if(isMoreSelect){
            liStr += liHTML.replace('</p>',item + '</p>');
        }else {
            liStr += liHTML.replace('</li>',item + '</li>');
        }
    });

    if(isMoreSelect){
        listHTML = moreSelectListHTML.replace('</ul>',liStr + '</ul>');
    }else {
        listHTML = aloneSelectListHtml.replace('</ul>',liStr + '</ul>');
    }
    returnHtmlStr = returnHtmlStr.replace(tdRule, function (tdStr) {
        //获取td上的attrName;
        nodeAttrName = tdStr.match(attrNameRule)[0].slice(10, -1);
        //符合attrName的td
        if(nodeAttrName == attrName){
            returnTdStr = tdStr.replace(btnRule,function (btnStr) {
                //展示btn
                returnBtnStr = btnStr.replace(classRule,function (classStr) {
                    return classStr.replace('_global_displayNone','');
                });
                return returnBtnStr;
                //    插入列表
            }).replace(listRule,'</button>' + listHTML + '</div></td>');

        }else {
            returnTdStr = tdStr;
        }
        return returnTdStr;
    });
    //释放参数内存
    for(let index in arguments){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
    return returnHtmlStr;
}*/

/**
 * 新增函数(内部)
 * 用修改字符串的形式修改th
 */
function rewriteTableThHTML(htmlStr,dataSource) {
    if(typeof dataSource != "object"){
        throw new Error('修改table的th名称函数传入的参数需为object/Array');
    }
    if(htmlStr.indexOf('</th>') < 0){
        return htmlStr;
    }
    let returnHtmlStr = htmlStr;
    let thRule = /<th[^>]+dataAttr[^>]+>((?!<th).)+<\/th>/g;
    let attrName;
    let shortTimeSave;
    let index;
    if(dataSource instanceof Array){
        index = 0;
        returnHtmlStr = returnHtmlStr.replace(thRule, function (thStr) {
            return thStr.replace(/>((?!<\/th>).)*<\/th>/,function (str) {
                if(dataSource[index] !== undefined){
                    shortTimeSave = '>' + dataSource[index] + '</th>';
                }else {
                    shortTimeSave = str;
                }
                index += 1;
                return shortTimeSave;
            });
        });
    }else {
        returnHtmlStr = returnHtmlStr.replace(thRule, function (thStr) {
            attrName = thStr.match(/attrname=('|")[^'"]*('|")/)[0].slice(10,-1);
            return thStr.replace(/>((?!<\/th>).)*<\/th>/,function (str) {
                if(dataSource[attrName] !== undefined){
                    shortTimeSave = '>' + dataSource[attrName] + '</th>';
                }else {
                    shortTimeSave = str;
                }
                return shortTimeSave;
            });
        });
    }
    for(let index in arguments){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
    return returnHtmlStr;
}

/**
 * 新增函数（内部）
 * 用于设置行高
 */
function setTableLineHeightHTML(htmlStr,heightValue) {
    let returnHtmlStr = htmlStr;
    let trRule = /<tr[^>]*>/g;
    let styleRule = /style=('|")[^'"]+('|")/;
    let heightRule = /height:[^;]+;?/;
    let tdRule = /<td[^>]+dataValue[^>]+>((?!<\/td>).)*<\/td>/g;
    let editBoxRule = /<div[^>]+editBox[^>]+>/;
    //存储heightValue的数值
    let trueLineHeight;
    let returnTrStr;
    let returnStyleStr;
    let returnTdStr;
    let returnBoxStr;

    //先过滤数值类型过滤
    heightValue = (typeof heightValue == "string" || typeof heightValue == "number") ? parseInt(heightValue) : 30;
    //获取数据高度数值
    trueLineHeight = (heightValue > 0) ? heightValue : 30;

    returnHtmlStr = returnHtmlStr.replace(trRule,function (trStr) {
        if(trStr.indexOf('style=') > -1){
            returnTrStr = trStr.replace(styleRule, function (styleStr) {
                if(styleStr.indexOf('height:') > -1){
                    returnStyleStr = styleStr.replace(heightRule,function () {
                        return 'height:' + trueLineHeight + 'px;'
                    });
                }else {
                    returnStyleStr = styleStr.slice(0, -1) + 'height:' + trueLineHeight + 'px' + styleStr.slice(-1);
                }
                return returnStyleStr;
            });
        }else {
            returnTrStr = trStr.slice(0,-1) + ' style="height:' + trueLineHeight + 'px;">';
        }
        return returnTrStr;
    }).replace(tdRule,function (tdStr) {
        returnTdStr = tdStr.replace(editBoxRule,function (boxStr) {
            if(boxStr.indexOf('style=') > -1){
                returnBoxStr = boxStr.replace(styleRule,function (styleStr) {
                    if(styleStr.indexOf('height:') > -1){
                        returnStyleStr = styleStr.replace(heightRule,function () {
                            return 'height:' + trueLineHeight + 'px;';
                        })
                    }else {
                        returnStyleStr = styleStr.slice(0,-1) + 'height:' + trueLineHeight + 'px;' + styleStr.slice(-1);
                    }
                    return returnStyleStr;
                })
            }else {
                returnBoxStr = boxStr.replace('>',' style="height:' + trueLineHeight + 'px;">');
            }
            return returnBoxStr;
        });
        return returnTdStr;
    });
    for(let index in arguments){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
    return returnHtmlStr;
}

/**
 * 新增函数（内部）
 * 用于显示想要显示的列
 */
function showColumn(htmlStr,attrNameArr) {
    let returnHtmlStr = htmlStr;
    let thRule = /<th[^>]+dataAttr[^>]*>((?!<\/th>).)*<\/th>/g;
    let tdRule = /<td[^>]+attrname[^>]+>/g;
    let classRule = /class=('|")[^'"]+('|")/;
    let nodeAttrName;
    let returnThStr;
    let returnTdStr;
    let returnClassStr;
    //暂时存储
    let shortTimeSave;

    if(attrNameArr != 'all'){
        returnHtmlStr = returnHtmlStr.replace(thRule,function (thStr) {
            nodeAttrName = thStr.match(/attrname=('|")[^'"]*('|")/)[0].slice(10,-1);
            if(inArray(nodeAttrName,attrNameArr) == -1){//隐藏
                returnThStr = thStr.replace(classRule,function (classStr) {
                    if(classStr.indexOf('_global_displayNone') < 0){
                        returnClassStr = classStr.slice(0,-1) + ' _global_displayNone' + classStr.slice(-1);
                    }else {
                        returnClassStr = classStr;
                    }
                    return returnClassStr;
                })
            }else {//显示
                returnThStr = thStr.replace(classRule,function (classStr) {
                    if(classStr.indexOf('_global_displayNone') > -1){
                        returnClassStr = classStr.replace('_global_displayNone','');
                    }else {
                        returnClassStr = classStr;
                    }
                    return returnClassStr;
                })
            }
            return returnThStr;
        }).replace(tdRule,function (tdStr) {
            //显示/隐藏table的td
            nodeAttrName = tdStr.match(/attrname=('|")[^'"]*('|")/)[0].slice(10,-1);
            if(inArray(nodeAttrName,attrNameArr) == -1){ //隐藏
                returnTdStr = tdStr.replace(classRule,function (classStr) {
                    if(classStr.indexOf('_global_displayNone') < 0){
                        returnClassStr = classStr.slice(0,-1) + ' _global_displayNone' + classStr.slice(-1);
                    }else {
                        returnClassStr = classStr;
                    }
                    return returnClassStr;
                })
            }else {//显示
                returnTdStr = tdStr.replace(classRule,function (classStr) {
                    if(classStr.indexOf('_global_displayNone') > -1){
                        returnClassStr = classStr.replace('_global_displayNone','');
                    }else {
                        returnClassStr = classStr;
                    }
                    return returnClassStr;
                })
            }
            return returnTdStr;
        });
    }
    // return htmlStrArr;
    for (let index in arguments){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
    return returnHtmlStr;
}


/**
 * 新增函数（内部）
 * 修改table中特定列中td的内容
 */
function rewriteLabelToTdHTML(htmlStr,rewriteDataObj) {
    let returnHtmlStr = htmlStr;
    let attrName = rewriteDataObj.attrName;
    let tdRule = /<td[^>]+dataValue+[^>]+>((?!<\/td>).)*<\/td>/g;
    let tdHeadRule = /<td[^>]+dataValue+[^>]+>/;
    let attrNameRule = /attrname=('|")[^'"]+('|")/;
    let tdHead;
    let labelAttrName;
    let returnTdStr;

    returnHtmlStr = returnHtmlStr.replace(tdRule,function (tdStr) {
        tdHead = tdStr.match(tdHeadRule)[0];
        labelAttrName = tdHead.match(attrNameRule)[0];
        if(labelAttrName.indexOf(attrName) > -1){
            tdHead = tdHead.slice(0,-1) + 'reset="true">';
            returnTdStr = tdHead + rewriteDataObj.htmlStr + '</td>';
        }else {
            returnTdStr = tdStr;
        }
        return returnTdStr;
    });
    for(let index in arguments){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
    return returnHtmlStr;
}

/**
 * 新增函数
 * 用于设定可以编辑的列
 */
function setEditColumn(htmlStr,editNameArr) {
    let tdRule = /<td((?!<\/td>).)+<\/td>/g;
    let attrNameRule = /attrname=('|")[^'"]*('|")/;
    let tdHeadLabelRule = /<td[^>]+>/;
    let editAbleRule = /qdeditable=('|")[^'"]+('|")/;
    let attrName;
    let returnTdStr;
    let returnHLStr;
    let returnHtml;

    returnHtml = htmlStr.replace(tdRule,function (tdStr) {
        if(tdStr.indexOf('attrname') > -1){
            if(editNameArr instanceof Array){
                attrName = tdStr.match(attrNameRule)[0].slice(10,-1);
                if(inArray(attrName,editNameArr) > -1){
                    returnTdStr = tdStr.replace(tdHeadLabelRule,function (headLabel) {
                        if(headLabel.indexOf('qdeditable') > -1){
                            returnHLStr = headLabel.replace(editAbleRule,'');
                        }else {
                            returnHLStr = headLabel;
                        }
                        return returnHLStr;
                    })
                }else {
                    returnTdStr = tdStr.replace(tdHeadLabelRule,function (headLabel) {
                        if(headLabel.indexOf('qdeditable') > -1){
                            returnHLStr = headLabel.replace(editAbleRule,'qdeditable="false"');
                        }else {
                            returnHLStr = headLabel.replace('>',' qdeditable="false"');
                        }
                        return returnHLStr;
                    });
                }
            }else if(editNameArr == 'all'){
                returnTdStr = tdStr.replace(tdHeadLabelRule,function (headLabel) {
                    if(headLabel.indexOf('qdeditable') > -1){
                        returnHLStr = headLabel.replace(editAbleRule,'');
                    }else {
                        returnHLStr = headLabel;
                    }
                    return returnHLStr;
                })
            }
        }else {
            returnTdStr = tdStr;
        }
        return returnTdStr;
    });
    for (let index in arguments){
        if(!isNaN(index)){
            arguments[index] = null;
        }
    }
    return returnHtml;
}

/**
 * 新增函数
 * 显示隐藏表格头部列
 */
function showTableHeadColumn(columnType,htmlStr,isShow) {
    let thRule;
    let tdRule;
    let trueCheckBoxRule;
    let classRule = /class=('|")[^'|"]*('|")/;
    let returnStr;
    let returnClassStr;
    let returnHtml;

    switch (columnType){
        case 'checkBox':
            thRule = /<th[^>]+dataAllSelect[^>]+>((?!<\/th>).)*<\/th>/;
            tdRule = /<td[^>]+dataItemSelect[^>]+>((?!<\/td>).)*<\/td>/g;
            trueCheckBoxRule = (htmlStr.indexOf('<th') > -1) ? thRule : tdRule;
            break;
        case 'number':
            thRule = /<th[^>]+dataItemIdName[^>]+>((?!<\/th>).)*<\/th>/;
            tdRule = /<td[^>]+dataItemId[^>]+>((?!<\/td>).)*<\/td>/g;
            trueCheckBoxRule = (htmlStr.indexOf('<th') > -1) ? thRule : tdRule;
            break;
        default:
            break;
    }
    //修改头部列的显示隐藏
    returnHtml = htmlStr.replace(trueCheckBoxRule,function (thStr) {
        returnStr = thStr.replace(classRule,function (classStr) {
            if(isShow){
                if(classStr.indexOf('_global_displayNone') > -1){
                    returnClassStr = classStr.replace('_global_displayNone','');
                }else {
                    returnClassStr = classStr;
                }
            }else {
                if(classStr.indexOf('_global_displayNone') < 0){
                    returnClassStr = classStr.slice(0,-1) + ' _global_displayNone' + classStr.slice(-1);
                }else {
                    returnClassStr = classStr;
                }
            }
            return returnClassStr;
        });
        return returnStr;
    });
    return returnHtml;
}


//创建table标题：th
function create_th() {
    let tableTitleTrHTML = trHTML;
    let selectIdHTML = thSelectIdHTML;
    // let trueData = (data instanceof Array) ? data[0] : data;
    let otherItemHTML = thHTML;
    let returnInnerHtml;

    //将头部的复选框和序号写入
    tableTitleTrHTML = tableTitleTrHTML.replace('></tr>',' name="tableTitle"></tr>').replace('</tr>',selectIdHTML + '</tr>');
    tableColumnOrder.forEach(function (attrName,index) {
        tableTitleTrHTML = tableTitleTrHTML.replace('</tr>',function () {
            returnInnerHtml = otherItemHTML.replace(/attrname=('|")[^'"]*('|")/,function (str) {
                return str.substring(0,10) + attrName + str.slice(-1);
            }).replace('></th>',function () {
                if(columnWidthArr[index] != null){
                    return 'style="width:'+ columnWidthArr[index] +'px"></th>';
                }else {
                    return '></th>';
                }
            }).replace('</th>',attrName + '</th>') + '</tr>';
            return returnInnerHtml;
        })
    });
    return tableTitleTrHTML;
}

//创建table内容：td
function create_td(data,index) {
    let tableContentTrHTML;
    let selectIdHTML = tdSelectIdHTML;
    let otherItemHTML = tdHTML;
    // let tdHeadLabelRule = /<td[^>]*name="dataValue"[^>]*>/;
    let returnInnerHtml;

    tableContentTrHTML = trHTML;
    tableContentTrHTML = tableContentTrHTML.replace('></tr>',' name="tableContent"></tr>').replace('</tr>',selectIdHTML + '</tr>');
    tableContentTrHTML = tableContentTrHTML.replace('</td></tr>',(index + 1) + '</td></tr>');
    tableColumnOrder.forEach(function (attrName,index) {
        tableContentTrHTML = tableContentTrHTML.replace('</tr>',function () {
            /**
             * 将自定义表头的宽度写入表格td上
             * returnInnerHtml = otherItemHTML.replace(tdHeadLabelRule,function (tdHeadStr) {
                if(columnWidthArr[index] != null){
                    return tdHeadStr.replace('name="dataValue"','name="dataValue" style="width:'+ columnWidthArr[index] +'px"');
                }else {
                    return tdHeadStr;
                }
            }).replace('attrname=""','attrname="' + attrName + '"').replace('</td>',data[attrName] + '</td>') + '</tr>';*/
            //修改tdhtml的内容
            returnInnerHtml = otherItemHTML.replace('attrname=""','attrname="' + attrName + '"').replace('</td>',data[attrName] + '</td>') + '</tr>';
            return returnInnerHtml;
        });
    });
    return tableContentTrHTML;
}