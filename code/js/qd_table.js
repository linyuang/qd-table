let qd_Table = function () {
    if(!(this instanceof qd_Table)){
        return new qd_Table();
    }
    //定义开发与生产模式
    const _mode_ = false;
    //功能按钮
    const funBtnHTML = '<button class="_qd_funBtnSize"></button>';
    //过渡动画
    const loadingDivHTML = '<div id="_qd_loading" class="_qd_tableLoadingDiv _global_displayNone"><p class="_qd_LoadingTip"></p><div class="_qd_tableLoading"><div class="_qd_LoadingRound1"></div><div class="_qd_LoadingRound2"></div><div class="_qd_LoadingRound3"></div></div></div>';
    //分页信息行的html
    const pagingInfoHtml = '<div class="_qd_pagingInfoDiv"><div class="_qd_pagingInfoLeftArea"><p class="_qd_pagingInfoTip"></p></div>' +
        '<div class="_qd_pagingInfoMidArea"><div class="_qd_pagingInfoUpPageDiv"><button><mark>首页</mark></button><button><mark>上一页</mark></button></div>' +
        '<div class="_qd_pagingInfoPageIndexDiv"></div><div class="_qd_pagingInfoDownPageDiv"><button><mark>下一页</mark></button><button><mark>末页</mark></button></div></div>' +
        '<div class="_qd_pagingInfoRightArea"><input class="_qd_pagingInfoJumpInput" size="1" type="text"><button class="_qd_pagingInfoJumpBtn"><mark>GO</mark></button></div></div>';
    //新表头的table的html
    const newTableTitleHtml = '<table class="_qd_newTableTitle" name="qd-table" border="1"></table>';
    //新表头tr的html
    const newTableTitleTrHtml = '<tr class="_qd_newTableTitleTr"></tr>';
    //批量修改框的html
    const batchEditDivHtml = '<div id="_qd_batchEdit" class="_qd_batchEditBgDiv _global_displayNone"><div class="_qd_batchEditDiv"><div class="_qd_batchEditTitle"><p class="_qd_batchEditTitleTip">批量修改</p><div class="_qd_batchEditTitleCloseDiv">' +
        '<p class="_qd_batchEditTitleClose">x</p></div></div><div class="_qd_batchEditContent"><div class="_qd_batchEditContentArea"></div></div><div class="_qd_batchEditFooter"><button class="_qd_batchEditBtn" value="editTrue">确定</button>' +
        '<button class="_qd_batchEditBtn" value="editFalse">取消</button></div></div></div>';
    //存储冻结承载框
    const freezeColDiv = '<div></div>';
    //冻结列的tableHtml
    const freezeColTableHtml = '<table class="freezeColTable" border="1"></table>';
    //三角div的html
    const triangleHTML = '<div class="_qd_tableTitleTriangleDiv"><div class="_qd_tableTitleTriangle _qd_tableTitleTriangleUp"></div></div>';
    //文本提示框
    const globalTipHTML = '<div id="_qd_contentTextTip" class="_qd_contentTextTip _global_displayNone"></div>';
    //设定列宽的col标签
    const colHtml = '<col span="1"/>';


    /*========================================  * 全局变量（当调用构造函数时初始化） *  ==========================================*/
    //数据源集合
    let dataSourceArr = {};
    //配置数据集合
    let configDataArr = {};
    //批量修改下标集合
    let batchEditIndexArr = {};
    //存储批量修改的数据
    let batchEditItemDataArr = {};
    //存储冻结列集合
    let freezeColumnAttrNameArr = {};
    //存储冻结列与滚动框的相对距离
    let freezeColumnTrueLeftArr = {};
    //存储冻结片段
    let freezeColPart = {};
    //存储列排序的数据
    let sortColConfig = {};
    //存储不同tableId下对应节点的宽度
    let nodeWidthArr = {};
    //存储列排序下标集合
    let sortIndexArr = {};
    //存储列排序的数据模板
    // let sortModelDataArr = {};



    //存储竖向拖拽线的左节点
    let leftNode;
    //存储竖向拖拽线的右节点
    let rightNode;
    //获取现编辑节点
    let nowEditTdNode;
    //是否重写数据
    let isReSetData = false;
    //存储触发了提示的节点
    let haveTipNode;
    //触发全局提示的定时器
    let globalTipTime;
    //全局判定是否触发拖拽线事件
    let isLineDrag = false;
    //判定是否点击了列排序
    let isColSort = false;

    /*========================================  * 全局变量（只要调用到写入数据源方法就会初始化） *  ==========================================*/
    //构造函数里的this指针
    let _this = this;
    //记录删除按钮的回调函数
    let deleteMethodCallBack = null;
    //记录添加按钮的回调函数
    let addMethodCallBack = null;
    //存储要作用的标签对象数组，特定id的qd-table元素或是所有的qd-table元素
    // let dataSourceDepth;
    //记录是否有传入callback
    let isCallback;
    //存储td的mouseUp事件
    let tdMouseUpEvent;
    //处理完成的htmlStr数组
    let finalHtmlStrArr;
    //存储头部table对象
    let titleTableObj;
    //存储最终生成table数组
    let finalTableArr;
    //存储复选框选中的行的序号
    let selectTrIndexArr;
    //存储要所有table片段里需要删除的行的集合
    let deleteItem;
    //分割行数
    let cutNum;
    //获取最后点击行的下标集合
    let finalSelTrIndexArr;
    //记录是否传输完成
    let isSendOver;
    //存储序号与数据源真实下标的差值
    let differentValue;
    //是否获取了表头
    let isSaveTitle;
    //是否正在执行添加函数
    let isAddNewTr;
    //是否分页显示
    let isPaging;
    //是否获取了片段的个数
    let isSavePageNum;
    //存储片段的个数
    let pageNum;
    //存储配置文件里的table宽度；
    let tableConfigWidth;
    //是否需要冻结
    let isFreeze;
    //存储内容区滚动条宽度
    let contentAreaScrollDivWidth;

    //存储webWorker对象
    let worker;

    //初始写入table数据延时器
    let saveTableDataTime;
    //功能按钮等待所有片段写入完成延时器
    let sendOverTime;

    //获取webWorker对象
    if(_mode_){
        worker = new Worker('js/qdTable_worker.min.js');
    }else {
        worker = new Worker('worker/qdTable_worker.js');
        // worker = new Worker('https://github.com/linyuang/qd-table/blob/master/webworker/qdTable_worker.min.js');
    }
    /**
     * 内部调用函数
     */
    //获取父级节点
    _this.parents = function (nowNodeObj,fatherNodeName) {
        //获取节点名称
        let nodeName;
        //获取查找条件
        let findIndex;
        //获取查找的标签属性
        let attrName;
        //获取查找的标签属性值
        let attrValue;
        //获取特殊字符的下标
        let index;
        //存储查找标志
        let findType;
        //存储作用节点
        let actNodeObj;
        //存储作用节点的名称
        let actTagName;
        let nodeArr = [];
        if(fatherNodeName.indexOf('#') > -1){
            findType = 1;
            index = fatherNodeName.indexOf('#');
            nodeName = fatherNodeName.substring(0,index);
            findIndex = fatherNodeName.substr(index + 1);
        }else if(fatherNodeName.indexOf('.') > -1){
            findType = 2;
            index = fatherNodeName.indexOf('.');
            nodeName = fatherNodeName.substring(0,index);
            findIndex = fatherNodeName.substr(index + 1);
        }else if(fatherNodeName.indexOf('[') > -1){
            findType = 3;
            index = fatherNodeName.indexOf('[');
            nodeName = fatherNodeName.substring(0,index);
            attrName = fatherNodeName.substring(index + 1,fatherNodeName.indexOf('='));
            attrValue = fatherNodeName.slice(fatherNodeName.indexOf('=') + 2,-2);
        }else {
            findType = 0;
            nodeName = fatherNodeName;
        }
        actNodeObj = nowNodeObj;
        actTagName = actNodeObj.tagName;
        switch (findType){
            case 0:
                while (actTagName.toLowerCase() != 'body'){
                    if(actTagName.toLowerCase() == nodeName){
                        nodeArr.push(actNodeObj);
                    }
                    actNodeObj = actNodeObj.parentNode;
                    actTagName = (actNodeObj != null) ? actNodeObj.tagName : 'body';
                }
                break;
            case 1:
                while (actTagName.toLowerCase() != 'body'){
                    if(actTagName.toLowerCase() == nodeName && actNodeObj.getAttribute('id') == findIndex){
                        nodeArr.push(actNodeObj);
                        break;
                    }
                    actNodeObj = actNodeObj.parentNode;
                    actTagName = (actNodeObj != null) ? actNodeObj.tagName : 'body';
                }
                break;
            case 2:
                while (actTagName.toLowerCase() != 'body'){
                    if(actTagName.toLowerCase() == nodeName && actNodeObj.className.indexOf(findIndex) > -1){
                        nodeArr.push(actNodeObj);
                    }
                    actNodeObj = actNodeObj.parentNode;
                    actTagName = (actNodeObj != null) ? actNodeObj.tagName : 'body';
                }
                break;
            case 3:
                while (actTagName.toLowerCase() != 'body'){
                    if(actTagName.toLowerCase() == nodeName && actNodeObj.getAttribute(attrName) == attrValue){
                        nodeArr.push(actNodeObj);
                    }
                    // console.log(actNodeObj);
                    actNodeObj = actNodeObj.parentNode;
                    actTagName = (actNodeObj != null) ? actNodeObj.tagName : 'body';
                }
                break;
            default:
                break;
        }
        return nodeArr;
    };

    //判定字符串是否存在于数组中
    _this.inArray = function (str,array) {
        if(!(array instanceof Array)){
            throw new Error('_this.inArray方法的array参数类型需为Array');
        }
        let index;
        let returnIndex = -1;
        for(index in array){
            if(!isNaN(index) && array[index] == str){
                returnIndex = index;
                break;
            }
        }
        return returnIndex;
    };

    //创建dom节点,改进：需根据字符串中的特殊标签创建特定的父标签，不然会造成标签缺少的情况
    _this.domNode = function (htmlStr) {
        let nodeNameRule = /<+?[\w]*(\s|\/|>)+?/;
        let nowNodeName;
        let fatherNodeName;
        let fatherDiv;
        let childNodes;
        let returnDomArr = [];
        nowNodeName = htmlStr.match(nodeNameRule)[0].slice(1,-1);
        switch (nowNodeName){
            case 'li':
                fatherNodeName = 'ul';
                break;
            case 'td':
                fatherNodeName = 'tr';
                break;
            case 'th':
                fatherNodeName = 'tr';
                break;
            case 'tr':
                fatherNodeName = 'tbody';
                break;
            default:
                fatherNodeName = 'div';
                break;
        }
        fatherDiv = document.createElement(fatherNodeName);
        fatherDiv.innerHTML = htmlStr;
        childNodes = fatherDiv.childNodes;
        for (let key in childNodes){
            if(!isNaN(key)){
                returnDomArr.push(childNodes[key]);
            }
        }
        return returnDomArr;
    };

    //用于将配置信息中调用的方法排序
    /*_this.SortMethod = function (methodNameArr) {
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
    };*/

    //计算特定区域滚动条滑块的长度
    _this.get_sliderHeight = function (mainAreaObj,otherHeight) {
        let tableArr = mainAreaObj.getElementsByTagName('table');
        let allTableHeight = 0;
        let returnHeight;
        otherHeight = otherHeight || 0;

        for(let tableKey in tableArr){
            if(!isNaN(tableKey)){
                allTableHeight += parseInt(tableArr[tableKey].offsetHeight);
            }
        }
        allTableHeight += otherHeight;
        returnHeight = parseInt(mainAreaObj.offsetHeight) * parseInt(mainAreaObj.scrollHeight) / allTableHeight;
        mainAreaObj = null;
        tableArr = null;
        return returnHeight;
    };

    //进行数组排序
    _this.sort_array = function (array,type) {
        type = type || array instanceof Array;
        let midAmount;
        if(type){
            array.sort(function (start,end) {
                return start - end;
            })
        }else {
            //通过下层发进行排序，每循环一次最后一个子项就不用进行对比
            for(let len = array.length;len > 1;len --){
                for (let index = 0; index < len - 1; index++) {
                    if (array[index] > array[index + 1]) {
                        midAmount = array[index];
                        array[index] = array[index + 1];
                        array[index + 1] = midAmount;
                    }
                }
            }
        }
    };

    //设置特定table的基础样式
    _this.table_init = function (tableObj) {
        tableObj.classList.add('_qd_tableSize');
        tableObj.setAttribute('border','1');
        tableObj.setAttribute('name','qd-table');
        tableObj = null;
    };

    //用于分割字符串长度
   /* _this.stringCutUp = function (domStr) {
        let trRule = /<tr((?!<\/tr>).)+<\/tr>/g;
        let nodeArr;
        let htmlStrItem = '';
        let returnArr = [];

        nodeArr = domStr.match(trRule);
        nodeArr.forEach(function (nodeObj,index) {
            htmlStrItem += nodeObj;
            if((index + 1) % 100 == 0){
                returnArr.push(htmlStrItem);
                htmlStrItem = '';
            }
        });
        domStr = null;
        return returnArr;
    };*/
    //初始化全局变量
    _this.init_globalVar = function (tableId) {
        //存储要作用的标签对象数组，特定id的qd-table元素或是所有的qd-table元素
        // dataSourceDepth = 0;
        //记录是否有传入callback
        isCallback = false;
        //初始化存储htmlStr的数组
        finalHtmlStrArr = [];
        //初始化tableContent区域子项的数组
        finalTableArr = {};
        //存储复选框选中的行的序号
        selectTrIndexArr = {};
        //存储要所有table片段里需要删除的行的集合
        deleteItem = {};
        //初始化片段数
        pageNum = {};
        //分割行数
        cutNum = 100;
        //记录是否传输完成
        isSendOver = false;
        //存储序号与数据源真实下标的差值
        differentValue = 1;
        //是否获取了表头
        isSaveTitle = false;
        //是否正在执行添加函数
        isAddNewTr = false;
        //是否分页显示
        isPaging = false;
        //是否获取了片段的个数
        isSavePageNum = false;
        //是否需要冻结
        isFreeze = false;
        //初始化最后选中的行下标
        finalSelTrIndexArr = {};
        //初始化内容区域滚动条宽度
        contentAreaScrollDivWidth = 0;

        //初始化片段集合
        if(finalTableArr[tableId] === undefined){
            finalTableArr[tableId] = [];
        }
        //初始化复选框下标数据
        if(selectTrIndexArr[tableId] === undefined){
            selectTrIndexArr[tableId] = [];
        }
        //初始化删除下标集合
        if(deleteItem[tableId] === undefined){
            deleteItem[tableId] = [];
        }
        //初始化片段数集合
        if(pageNum[tableId] === undefined){
            pageNum[tableId] = [];
        }
        //初始化最后选中的行下标集合
        if(finalSelTrIndexArr[tableId] === undefined){
            finalSelTrIndexArr[tableId] = 0;
        }
    };

    //用于获取选中行数组与当前table片段的关系（包括：比片段的最小行还小的行有多少个，在片段里的行是哪些）
    _this.selectArrOnTable = function (tableId,tableIndex,selectArr) {
        //table中的第一个tr下标与下一个table中的第一个下标
        let minIndex;
        let maxIndex;
        //存储在当前table片段之前的tr个数
        let lessIndexAmount = 0;
        //存储要删除的下标集合
        let tableDelIndexArr = [];
        //获取td的集合
        let tdArr;

        tdArr = finalTableArr[tableId][tableIndex].getElementsByTagName('tr')[0].getElementsByTagName('td');
        //遍历td集合
        for(let tdKey in tdArr){
            if(!isNaN(tdKey) && tdArr[tdKey].getAttribute('name') == 'dataItemId'){
                minIndex = parseInt(tdArr[tdKey].textContent);
                tdArr = null;
                break;
            }
        }
        //获取当前片段中最后一行的下标
        maxIndex = minIndex + finalTableArr[tableId][tableIndex].getElementsByTagName('tr').length;
        //遍历选中的下标集合
        selectArr.forEach(function (item) {
            if(item < maxIndex){
                if(item < minIndex){
                    lessIndexAmount += 1;
                }else {
                    tableDelIndexArr.push(item);
                }
            }
        });
        for(let index in arguments){
            if(!isNaN(index)){
                arguments[index] = null;
            }
        }
        return{
            minAmount:lessIndexAmount,
            delArr:tableDelIndexArr
        }
    };

    //根据关系信息对table片段中的行进行删除;
    _this.delete_trItem = function (tablePart,deleteDataObj) {
        //存储在当前table片段前端的tr的个数
        let minTrAmount = deleteDataObj.minAmount;
        //存储在片段中要删除的tr下标
        let delTrArr = deleteDataObj.delArr;
        //存储当前片段里的tr集合
        let trArr = tablePart.getElementsByTagName('tr');
        //存储第一个tr的序号
        let theFirstIndex;
        //暂时存储对象
        let shortTimeSave;
        //存储要删除的单个下标
        let deleteIndex;
        //存储要删除tr对象
        let deleteTrObj;
        //暂时存储tr的子项
        shortTimeSave = trArr[0].childNodes;
        //获取第一行的下标
        for(let tdKey in shortTimeSave){
            if(!isNaN(tdKey)){
                if(shortTimeSave[tdKey].getAttribute('name') == 'dataItemId'){
                    theFirstIndex = parseInt(shortTimeSave[tdKey].textContent);
                    break;
                }
            }
        }
        //删除片段中的tr
        while (delTrArr.length > 0){
            deleteIndex = delTrArr.shift();
            for(let trKey in trArr){
                if(!isNaN(trKey)){
                    shortTimeSave = trArr[trKey].childNodes;
                    for(let tdKey in shortTimeSave){
                        if(!isNaN(tdKey) && shortTimeSave[tdKey].getAttribute('name') == 'dataItemId'){
                            if(shortTimeSave[tdKey].textContent == deleteIndex){
                                deleteTrObj = trArr[trKey];
                                break;
                            }
                        }
                    }
                    if(deleteTrObj != null){
                        tablePart.getElementsByTagName('tbody')[0].removeChild(deleteTrObj);
                        deleteTrObj = null;
                        break;
                    }
                }
            }
        }
        //重新排序
        theFirstIndex -= minTrAmount;
        for(let trKey in trArr){
            if(!isNaN(trKey)){
                shortTimeSave = trArr[trKey].childNodes;
                for(let tdKey in shortTimeSave){
                    if(!isNaN(tdKey) && shortTimeSave[tdKey].getAttribute('name') == 'dataItemId'){
                        shortTimeSave[tdKey].innerText = theFirstIndex;
                        theFirstIndex += 1;
                        break;
                    }
                }
            }
        }
        //释放内存
        delTrArr = null;
        trArr = null;
        shortTimeSave = null;
        deleteTrObj = null;
        tablePart = null;
        deleteDataObj = null;
    };

    //删除特定的table片段
    _this.delete_tablePart = function (tableId,tableLevelIndex) {
        //删除对应的片段
        finalTableArr[tableId].splice(tableLevelIndex,1);
        //修改剩余片段的下标
        finalTableArr[tableId].forEach(function (tableObj,index) {
            if(index > tableLevelIndex - 1){
                tableObj.setAttribute('levelindex',index);
            }
        })
    };

    //对即将展示的片段进行操作(删除，修改，全选的勾选)，返回处理后的片段
    _this.dealWith_tablePart = function (tableId, dealWithPartIndex, liftType) {
        //存储要返回table片段
        let actNewTablePart = null;
        //要处理的table片段下标
        let tableIndex = dealWithPartIndex;
        //当前片段要删除的行下标数组
        let nowDeleteIndexArr;
        //存储片段删除的关键信息（当前片段内要删除行、片段外要删除的行的个数）
        let delLinkInfo;
        //存储当前片段的tr数组
        let trArr;
        //存储当前行下标
        let nowActTrIndex;
        //是否跳出最外层循环
        let isBreak = false;
        //暂时存储
        let shortTimeSave;
        //初始化liftType,liftType是用于滚动时向上查找或是向下查找
        liftType = liftType || 'after';

        //判断传入处理的片段下标是否符合要求
        if(tableIndex > -1 && tableIndex < finalTableArr[tableId].length){
            while (actNewTablePart == null){
                //获取当前要插入的table片段
                actNewTablePart = finalTableArr[tableId][tableIndex];
                //当'要删除集合'中存在子项时进行删除操作
                if(deleteItem[tableId] !== undefined && deleteItem[tableId].length > 0){
                    //根据'要删除下标集合’中的数据进行删除处理(新添加的片段是没有对应的删除下标集合，所以需要判断)
                    if(deleteItem[tableId][tableIndex] !== undefined && deleteItem[tableId][tableIndex].length > 0){
                        trArr = actNewTablePart.getElementsByTagName('tr');
                        while (deleteItem[tableId][tableIndex].length > 0){
                            //获取对应子项(因为有可能多次删除，所以每次删除都会在对应的数组push进新的‘要删除下标’数组)
                            nowDeleteIndexArr = deleteItem[tableId][tableIndex].shift();
                            //用于获取选中行集合在当前table片段的关键信息
                            delLinkInfo = _this.selectArrOnTable(tableId,tableIndex,nowDeleteIndexArr);
                            //判断是否删除了片段中的全部行
                            if(delLinkInfo.delArr.length == trArr.length){
                                //清空内容
                                finalTableArr[tableId][tableIndex].innerHTML = '';
                                //删除集合中的table片段
                                _this.delete_tablePart(tableId,tableIndex);
                                //删除deleteItem集合里对应的数据
                                deleteItem[tableId].splice(tableIndex,1);
                                //清除对片段的引用
                                actNewTablePart = null;
                                //当片段数组全部删除是跳出循环
                                if(finalTableArr[tableId].length == 0){
                                    isBreak = true;
                                }else{
                                    if(liftType == 'before'){
                                        if(tableIndex > 0){
                                            tableIndex -= 1;
                                        }else {
                                            isBreak = true;
                                        }
                                    }else {
                                        if(tableIndex == finalTableArr[tableId].length){
                                            isBreak = true;
                                        }
                                    }
                                }
                                //因片段被删除，其对应的删除下标集合也被删除，所以直接跳出当前循环
                                break;
                            }else {//不会删除片段内的全部行
                                //根据批量修改内容进行修改，当不会删除片段时触发
                                if(batchEditItemDataArr[tableId] !== undefined && batchEditItemDataArr[tableId][tableIndex] !== undefined){
                                    _this.edit_aloneTablePart(tableId,actNewTablePart);
                                }
                                //根据删除信息删除table片段中的tr;
                                _this.delete_trItem(actNewTablePart,delLinkInfo);
                            }
                        }
                    }
                }else {
                    //根据批量修改内容进行修改，当没有点击过删除按钮时触发
                    if(batchEditItemDataArr[tableId] !== undefined && batchEditItemDataArr[tableId][tableIndex] !== undefined){
                        _this.edit_aloneTablePart(tableId,actNewTablePart);
                    }
                }
                if(isBreak){
                    isBreak = false;
                    break;
                }
            }
            //勾选/取消全选后，片段复选框的状态变化（点击删除按钮导致selectTrIndexArr.length = 0,不需要考虑，因为所有选中的行都会被删除，不需要去勾选复选框）
            if(actNewTablePart != null){
                //获取当前的复选框节点
                let nowCheckBoxNode;
                //初始化shortTimeSave;
                shortTimeSave = {};
                //初始化页面的选中情况
                trArr = actNewTablePart.getElementsByTagName('tr');
                //遍历行集合
                for(let trKey in trArr){
                    if(!isNaN(trKey)){
                        //获取当前复选框节点
                        nowCheckBoxNode = trArr[trKey].getElementsByTagName('td')[0].getElementsByTagName('input')[0];
                        //获取行下标
                        nowActTrIndex = parseInt(trArr[trKey].getElementsByTagName('td')[1].textContent);
                        //生成假event
                        shortTimeSave.target = nowCheckBoxNode;
                        //调用复选框的点击事件
                        _this.bindChangeEvent_checkbox(shortTimeSave,tableId);
                        //当前复选框选中
                        if(_this.inArray(nowActTrIndex,selectTrIndexArr[tableId]) > -1){
                            if(!nowCheckBoxNode.checked){
                                //修改复选框的选中状态
                                nowCheckBoxNode.checked = !nowCheckBoxNode.checked;
                                //触发change事件
                                nowCheckBoxNode.onchange();
                            }
                        }else if(nowCheckBoxNode.checked){
                            //修改复选框的选中状态
                            nowCheckBoxNode.checked = !nowCheckBoxNode.checked;
                            //触发change事件
                            nowCheckBoxNode.onchange();
                        }
                    }
                }
                //若选中行下标集合中对应的数据length不为0时
                /*if(selectTrIndexArr[tableId].length != 0){
                    //获取行集合
                    trArr = actNewTablePart.getElementsByTagName('tr');
                    //遍历行
                    for(let trKey in trArr){
                        if(!isNaN(trKey)){
                            //获取当前复选框节点
                            nowCheckBoxNode = trArr[trKey].getElementsByTagName('td')[0].getElementsByTagName('input')[0];
                            //获取行下标
                            nowActTrIndex = parseInt(trArr[trKey].getElementsByTagName('td')[1].textContent);
                            //若存在选中
                            if(_this.inArray(nowActTrIndex,selectTrIndexArr[tableId]) > -1 && !nowCheckBoxNode.checked){
                                //生成假event
                                shortTimeSave.target = nowCheckBoxNode;
                                //调用复选框的点击事件
                                _this.bindChangeEvent_checkbox(shortTimeSave,tableId);
                                //改变复选框的选中状态
                                nowCheckBoxNode.checked = !nowCheckBoxNode.checked;
                                //触发复选框的change事件
                                nowCheckBoxNode.onchange();
                                // trArr[trKey].getElementsByTagName('td')[0].getElementsByTagName('input')[0].checked = true;
                            }
                        }
                    }
                }*/
                trArr = null;
            }
            //用于修改每页的列宽度
            if(actNewTablePart != null){
                //修改新片段的节点宽度
                _this.reset_tableChildNodeWidth(tableId,actNewTablePart);
            }
        }
        return actNewTablePart;
    };

    // 获取元素相对应浏览器的绝对定位的left
    _this.get_elePositionLeft = function (ele) {
        let returnLeft = ele.offsetLeft;
        let parent = ele.offsetParent;
        while (parent !== null){
            returnLeft += parent.offsetLeft;
            parent = parent.offsetParent;
        }
        return returnLeft;
    };

    // 获取元素相对应浏览器的绝对定位的top
    _this.get_elePositionTop = function (ele) {
        let returnTop = ele.offsetTop;
        let parent = ele.offsetParent;
        while (parent !== null){
            returnTop += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return returnTop;
    };

    // 计算元素距离指定父框的左长度
    _this.get_eleToFatherLeft = function (eleObj,faObj) {
        let eleTrueLeft;
        let faTrueLeft;
        let returnLeft;
        eleTrueLeft = _this.get_elePositionLeft(eleObj);
        faTrueLeft = _this.get_elePositionLeft(faObj);
        returnLeft = (eleTrueLeft > faTrueLeft) ? eleTrueLeft - faTrueLeft : faTrueLeft - eleTrueLeft;
        return returnLeft;
    };

    //在body末尾插入节点
    _this.append_nodeToBodyEnd = function (node) {
        //获取body节点
        let body = document.body;
        //获取body的直接子节点
        let childNode = body.children;
        //循环子节点
        for(let index in childNode){
            if(!isNaN(index)){
                //当循环到script节点时，在该节点前插入并跳出
                if(childNode[index].tagName.toLowerCase() == 'script'){
                    body.insertBefore(node,childNode[index]);
                    break;
                    //当最后一个子节点都不为script时，直接在body的最后插入并跳出
                }else if(index == childNode.length - 1){
                    body.appendChild(node);
                    break;
                }
            }
        }
    };

    //获取打开编辑弹出框的属性名数组
    function getOpenEditBoxAttrName(configData) {
        //暂时存储
        let shortTimeSave;
        //存储返回的名称数组
        let returnAttrNameArr = [];

        if(configData.writeLinkData !== undefined){
            //暂时存储
            shortTimeSave = configData.writeLinkData;
            //若数据类型是array时
            if(shortTimeSave instanceof Array){
                //遍历数据
                shortTimeSave.forEach(function (item) {
                    if(_this.inArray(item.attrName,returnAttrNameArr) < 0){
                        //存储名称
                        returnAttrNameArr.push(item.attrName);
                    }

                })
            }else {
                if(_this.inArray(shortTimeSave.attrName,returnAttrNameArr) < 0){
                    //存储名称
                    returnAttrNameArr.push(shortTimeSave.attrName);
                }
            }
        }

        if(configData.openEditBox !== undefined){
            //存储数据
            shortTimeSave = configData.openEditBox;
            //遍历数据
            shortTimeSave.forEach(function (item) {
                if(_this.inArray(item,returnAttrNameArr) < 0){
                    returnAttrNameArr.push(item);
                }
            });
        }

        return returnAttrNameArr;
    }




    /**
     * 方法：通过数据源初始化表格
     */
    _this.set_dataSource = function (tableId,newData,configDataObj) {
        configDataObj = configDataObj || {};
        //tableId对应的对象
        let tableObj = document.getElementById(tableId);
        //是否重写数据
        let isResetData;
        //存储configDataObj的属性数组
        let configDataAttrNameArr = Object.keys(configDataObj);
        //存储数据引用
        let _data;
        //存储table区域
        let tableAreaObj;
        //存储数据
        let compoundData = {};
        //存储tr片段
        let htmlStr;
        //存储table标题tr的html
        let tableTitleHtml;
        //存储table片段下标
        let tablePartIndex = 0;
        //存储table的title展示区
        let tableTitleArea;
        //存储table的content展示区
        let tableContentArea;
        //获取表头区域中的table;
        let titleTableArr;
        //存储临时tableObj;
        let shortTimeTableObj;
        //存储是否隐藏功能按钮区
        let isAppendFunArea = true;
        //存储是否需要批量修改框
        let isNeedBatchEdit = true;
        //存储分页信息行对象
        let pagingInfoDiv;
        //获取每个table片段的生成时间，作为定时器的时间参数
        let pageRunTime = undefined;
        //存储外联样式表
        let currentStyle;
        //储存新的tableTitle对象
        let newTableTitleObj;
        //存储编辑框节点
        let editBoxNode;
        //存储拖拉线节点
        let dragLineNode;
        //存储tip浮框节点
        let tipNode;
        //记录开始时间
        let starTime;
        //记录结束时间
        let endTime;
        //获取列宽度数据
        let colWidthData = {};

        if(tableObj.tagName.toLowerCase() == 'div' && tableObj.getAttribute('name') == 'tableFather'){
            //是重写数据
            isResetData = true;
        }else {
            //不是重写数据
            isResetData = false;
        }
        //初始化全局变量
        _this.init_globalVar(tableId);
        //记录数据源
        dataSourceArr[tableId] = newData;
        //记录配置数据
        configDataArr[tableId] = configDataObj;
        //初始写入数据时新建展示区域
        if(!isResetData){
            //创建父框div
            _this.create_fatherDiv(tableId);
        }else {
            //重写数据时，删除功能按钮区(有可能功能区的按钮不一样)
            tableObj.removeChild(tableObj.firstElementChild);
            //清楚定时器
            _this.clear_mainTime();
            //重设置宽度集合
            nodeWidthArr[tableId].forEach(function (item) {
                item.isReset = true;
            })
        }
        //获取拖拽线节点
        dragLineNode = document.getElementById('vLineDiv');
        if(dragLineNode == null){
            _this.append_dragLine();
        }
        //获取编辑框节点
        editBoxNode = document.getElementById('_qd_tableTdEdit');
        //若获取不到编辑框则生成编辑框
        if(editBoxNode == null){
            _this.append_editBox();
        }
        //获取tip节点
        tipNode = document.getElementById('_qd_contentTextTip');
        //若获取不到则生成新的提示框
        if(tipNode == null){
            _this.append_contentTip();
        }

        //获取table区域对象
        tableAreaObj = (isResetData) ? tableObj : document.getElementById(tableId);
        //清楚shortTimeNode的缓存
        tableObj = null;

        //若tableId下的nodeWidth为空，则初始化宽度集合
        if(nodeWidthArr[tableId] === undefined){
            nodeWidthArr[tableId] = [];
        }
        //是否要分页
        if(configDataObj.setPartRows !== undefined){
            isPaging = configDataObj.setPartRows.isPaging;
            cutNum = configDataObj.setPartRows.partRows;
            if(isPaging && document.getElementById(tableId + '_pagingInfo') == null){
                //创建分页信息行(这里创建是为了后面的横向滚动事件的绑定)
                pagingInfoDiv = _this.domNode(pagingInfoHtml)[0];
                pagingInfoDiv.setAttribute('id',tableId + '_pagingInfo');
                tableAreaObj.appendChild(pagingInfoDiv);
            }
        }
        //判定是否要功能按钮区且是否需要批量修改
        if(configDataObj.funAreaAppend !== undefined){
            isAppendFunArea = configDataObj.funAreaAppend.isAppend;
            isNeedBatchEdit = isAppendFunArea;
        }
        //自定义功能区代码，若清除功能按钮则不添加批量修改
        if(configDataObj.buttonRender !== undefined){
            isNeedBatchEdit = !configDataObj.buttonRender.isCleanAll;
        }
        //创建功能按钮
        if(isAppendFunArea && tableAreaObj.getElementsByClassName('_qd_funBtnDivSize').length == 0){
            _this.create_funBtnDiv(tableId);
        }
        //创建批量修改框表
        if(isNeedBatchEdit && document.getElementById('_qd_batchEdit') === null){
            //插入批量修改框
            _this.append_batchEdit();
            //绑定批量修改表格事件
            _this.mouseDown_batchEditTable();
        }
        //是否有设置tableWidth
        if(configDataObj.setTableWidth !== undefined){
            let tableFatherArea = document.getElementById(tableId);

            //需要由一个全局变量来存储表格宽度的配置参数，不然会因为不断修改原配置信息导致表格不断缩小
            tableConfigWidth = configDataObj.setTableWidth.tableWidth;
            _this.set_tableWidthHTML(tableFatherArea, tableConfigWidth, configDataObj.setTableWidth.isEqual);
            //绑定横向滚动事件
            _this.scroll_tableAreaFather(tableFatherArea);
            /* 弃用：因为拖拽会导致原本没有横向滚动条的页面出现横向滚动条，所以弃用下面的判定代码，直接一开始就绑定滚动条事件
             //获取tableFather区域上一层的承载框
             // let qdTableFatherDiv = tableFatherArea.parentNode;
            //body无法通过offsetWidth和clientWidth进行有无出现滚动的判定
            if(qdTableFatherDiv.tagName.toLowerCase() == 'body'){
                //当判定横向滚动条的节点是body的时候，需要通过子项的实际宽度和body的显示宽度 + body是否允许横向滚动条来判定是否出现滚动条
                if(tableFatherArea.offsetWidth > qdTableFatherDiv.clientWidth){
                    //获取外联样式表
                    currentStyle = qdTableFatherDiv.currentStyle || getComputedStyle(qdTableFatherDiv,null);
                    if(currentStyle.overflowX == 'auto' || currentStyle.overflowX == 'scroll' || currentStyle.overflowX == 'visible'){
                        _this.scroll_tableAreaFather(tableFatherArea);
                    }
                }
            }else {
                //当除body外的其他子节点，则通过offsetHeight,clientHeight来判定是否出现滚动条
                if(qdTableFatherDiv.clientHeight < qdTableFatherDiv.offsetHeight){
                    _this.scroll_tableAreaFather(tableFatherArea);
                }
            }*/
            tableFatherArea = null;
        }
        //判定是否由列排序导致的表格重写
        if(isColSort){
            //若是，重置为false
            isColSort = false;
        }else {
            //初始化下标集合
            if(sortIndexArr[tableId] === undefined){
                //新建空数组
                sortIndexArr[tableId] = [];
            }else if(sortIndexArr[tableId].length > 0){
                //新建空数组
                sortIndexArr[tableId] = [];
            }
            //初始化三角符号的判定数据
            sortColConfig = {};
        }

        //显示过渡页面
        _this.show_loadingPage(true);

        //执行内部接口
        if(configDataAttrNameArr.length > 0){
            configDataAttrNameArr.forEach(function (attr) {
                _data = configDataObj[attr];
                switch (attr){
                    //插入新功能按钮
                    case 'buttonRender':
                        _this.rewrite_funBtnArea(tableAreaObj,_data);
                        break;
                    default:
                        break;
                }
            })
        }

        //获取传入worker的复合数据（数据源 + 配置文件）
        compoundData.dataSource = newData;
        compoundData.configData = configDataObj;

        //获取table的title展示对象
        tableTitleArea = tableAreaObj.getElementsByClassName('_qd_tableTitleDiv')[0];
        //获取table的content展示对象
        tableContentArea = tableAreaObj.getElementsByClassName('_qd_tableContentDiv')[0];

        //绑定展示区的mousemove事件
        _this.bind_tableContentArea(tableId,tableContentArea);

        //如果是重写数据，则需要清空两个
        if(isResetData){
            tableTitleArea.innerHTML = '';
            tableContentArea.innerHTML = '';
        }

        //获取列宽数据
        colWidthData = getColWidth(tableId);

        //将复合数据传入worker
        worker.postMessage(compoundData);
        //获取worker返回的数据
        worker.onmessage = function (event) {
            //如果是因执行添加函数返回的数据，则不执行以下代码
            if(isAddNewTr){
                return;
            }
            //获取返回的数据
            htmlStr = event.data;
            //判定是否传送完所有数据片段
            if(htmlStr != 'over'){
                //获取最开始返回的片段数
                if(!isSavePageNum){
                    pageNum[tableId] = htmlStr;
                    isSavePageNum = true;
                    return;
                }
                //获取table标题的html
                if(!isSaveTitle){
                    isSaveTitle = true;
                    tableTitleHtml = htmlStr;
                    //新建table对象
                    titleTableObj = document.createElement('table');
                    //初始化table对象的属性，样式，类名
                    _this.table_init(titleTableObj);
                    //插入col标签
                    appendColNode(tableId,titleTableObj,colWidthData);
                    //写入标题html
                    titleTableObj.innerHTML += tableTitleHtml;
                    //根据配置数据设置头部table的样式
                    _this.set_configToTable(titleTableObj,configDataObj);
                    //写入头部table区域
                    tableTitleArea.appendChild(titleTableObj);
                    //若配置参数里的resetTableTitle属性（自定义表头）不为undefined时，执行表头生成和替换
                    if(configDataObj.rewriteTableTitle !== undefined && configDataObj.rewriteTableTitle.diyTitleData !== undefined){
                        //将源表头隐藏，重写时表头区域已经被清空了一遍，所以不需要判定自定义表头的存在
                        if(titleTableObj.className.indexOf('_global_displayNone') < 0){
                            titleTableObj.classList.add('_global_displayNone');
                        }
                        //生成新表头（table标签,空标签）
                        newTableTitleObj = _this.domNode(newTableTitleHtml)[0];
                        //复制默认表头的样式，width+tableLayout
                        _this.set_configToTable(newTableTitleObj,configDataObj);
                        // newTableTitleObj.style.width = titleTableObj.style.width;
                        // newTableTitleObj.style.tableLayout = titleTableObj.style.tableLayout;
                        // newTableTitleObj.style.tableLayout = 'auto';
                        //插入col标签
                        appendColNode(tableId,newTableTitleObj,colWidthData);
                        //插入新表头(需要先插入的原因：后面的方法需要根据新表头找到旧表头)
                        tableTitleArea.appendChild(newTableTitleObj);
                        //将自定义表头的内容插入table节点中
                        _this.recreate_tableTitle(newTableTitleObj,configDataObj.rewriteTableTitle.diyTitleData,1);
                        //将排序三角形插入自定义表头
                        _this.append_tableTitleTriangle(newTableTitleObj);
                        //修改表格宽度
                        _this.reset_tableChildNodeWidth(tableId,newTableTitleObj);
                        //释放内存
                        newTableTitleObj = null;
                    }else {
                        //将排序三角形插入原表头
                        _this.append_tableTitleTriangle(titleTableObj);
                        //修改表格宽度
                        _this.reset_tableChildNodeWidth(tableId,titleTableObj);
                    }
                    //绑定表头的点击事件
                    _this.bind_tableTitleMouseDown(tableId);
                    //释放内存
                    titleTableObj = null;
                }else {
                    //初始化html片段集合中的子项
                    if(finalHtmlStrArr == null){
                        finalHtmlStrArr = [];
                    }
                    //将提取后剩下的数据段存入数据段集合里
                    finalHtmlStrArr.push(htmlStr);
                    //判断是否需要分页，需要时只加载一个片段，不需要就按原本的加载逻辑
                    if(isPaging){
                        if(tableContentArea.getElementsByTagName('table').length == 0){
                            //记录开始时间（用于记录生成一个片段需要的时间）
                            starTime = new Date().getTime();
                            //新建table节点
                            shortTimeTableObj = document.createElement('table');
                            //给新table节点写入col标签节点
                            appendColNode(tableId,shortTimeTableObj,colWidthData);
                            //初始化table节点的样式，属性，类
                            _this.table_init(shortTimeTableObj);
                            //为节点添加新属性'levelindex'
                            shortTimeTableObj.setAttribute('levelindex',tablePartIndex);
                            //将第一片段写入table节点
                            shortTimeTableObj.innerHTML += finalHtmlStrArr.shift();
                            //配置数据中非生成表格的方法进行表格修改
                            _this.set_configToTable(shortTimeTableObj,configDataObj);
                            //将新table节点插入展示区域
                            tableContentArea.appendChild(shortTimeTableObj);
                            //初始化片段集合
                            if(finalTableArr[tableId] === undefined){
                                finalTableArr[tableId] = [];
                            }
                            //将table节点存入数组
                            finalTableArr[tableId].push(shortTimeTableObj);
                            //修改table节点的宽度
                            _this.reset_tableChildNodeWidth(tableId,shortTimeTableObj);
                            //释放内存
                            shortTimeTableObj = null;
                            //记录下一个table片段的下标
                            tablePartIndex += 1;
                            //记录结束时间
                            endTime = new Date().getTime();
                            if(pageRunTime === undefined){
                                //记录片段执行时间
                                pageRunTime = endTime - starTime;
                                //释放变量
                                starTime = null;
                                endTime = null;
                            }
                            //获取分页信息行的节点
                            pagingInfoDiv = document.getElementById(tableId + '_pagingInfo');
                            //若分页信息行不存在，就新建分页信息行
                            if(pagingInfoDiv == null){
                                //创建分页信息行
                                pagingInfoDiv = _this.domNode(pagingInfoHtml)[0];
                                //赋值id
                                pagingInfoDiv.setAttribute('id',tableId + '_pagingInfo');
                                //插入节点
                                tableAreaObj.appendChild(pagingInfoDiv);
                                //释放内存
                                pagingInfoDiv = null;
                            }
                            //初始化分页信息行
                            _this.init_tablePage(pageNum[tableId],tableId);
                        }
                    }else {
                        //分配内容区域的高度
                        _this.set_contentAreaHeight(tableAreaObj);
                        //当内容区不出现滚动条时，一直往内容去添加table(这里的重复是基于worker.onmessage触发的)
                        if(tableContentArea.clientWidth == tableContentArea.offsetWidth){
                            //记录开始时间
                            starTime = new Date().getTime();
                            //获取新建的table节点
                            shortTimeTableObj = document.createElement('table');
                            //给新table节点写入col标签节点
                            appendColNode(tableId,shortTimeTableObj,colWidthData);
                            //初始化table节点
                            _this.table_init(shortTimeTableObj);
                            //赋值levelIndex属性
                            shortTimeTableObj.setAttribute('levelindex',tablePartIndex);
                            //写入内容
                            shortTimeTableObj.innerHTML += finalHtmlStrArr.shift();
                            //将配置信息里的table节点相关数据反映到该table节点上
                            _this.set_configToTable(shortTimeTableObj,configDataObj);
                            //插入table节点
                            tableContentArea.appendChild(shortTimeTableObj);
                            //将tableObj存入数组
                            finalTableArr[tableId].push(shortTimeTableObj);
                            //片段数 +1
                            tablePartIndex += 1;
                            //记录结束时间
                            endTime = new Date().getTime();
                            //若记录片段生成周期为空，则获取生成周期
                            if(pageRunTime === undefined){
                                //记录片段执行时间
                                pageRunTime = endTime - starTime;
                                starTime = null;
                                endTime = null;
                            }
                            //出现滚动条后，进行头部和内容去的table宽度的调整，以防被滚动条挡住内容（每次写入新数据只改写一次）
                            if(tableContentArea.clientWidth != tableContentArea.offsetWidth && contentAreaScrollDivWidth == 0){
                                //获取滚动条的宽度
                                contentAreaScrollDivWidth = tableContentArea.offsetWidth - tableContentArea.clientWidth;
                                //获取当前内容区域的可见宽度
                                tableConfigWidth = tableContentArea.clientWidth;
                                //表头区域
                                tableTitleArea = tableContentArea.previousElementSibling;
                                //获取表头table集合
                                titleTableArr = tableTitleArea.getElementsByTagName('table');
                                //遍历修改表头宽度
                                for(let index in titleTableArr){
                                    if(!isNaN(index)){
                                        titleTableArr[index].style.width = tableConfigWidth + 'px';
                                    }
                                }
                            }
                            //修改table中td的宽度(需要写在滚动条判定之后的原因：1.出现滚动条之后表头table和内容table的宽度需要重新设置，2.内容table需要根据表头宽度来设置自身的宽度)
                            _this.reset_tableChildNodeWidth(tableId,shortTimeTableObj);
                            //释放内存
                            shortTimeTableObj = null;
                        }
                    }
                }
            }else {
                //html传输完成后关闭过渡页面
                _this.show_loadingPage(false);
                //存储table的样式配置数据
                // configDataArr[tableId] = configDataObj.setTableWidth;
                if(finalTableArr[tableId].length > 0 && tableAreaObj.getElementsByClassName('_qd_tableContentDiv')[0].onscroll == null){
                    //集合写入完毕进行内容区域的滚动事件绑定
                    _this.event_tableContentDivScroll(tableAreaObj);
                }
                //要htmlStr集合的子项不为空时才执行以下代码
                if(finalHtmlStrArr.length != 0){
                    saveTableDataTime = setInterval(function () {
                        shortTimeTableObj = document.createElement('table');
                        //给新table节点写入col标签节点
                        appendColNode(tableId,shortTimeTableObj,colWidthData);
                        //初始化table的样式
                        _this.table_init(shortTimeTableObj);
                        //设置table片段下标
                        shortTimeTableObj.setAttribute('levelindex',tablePartIndex);
                        //写入table片段内容
                        shortTimeTableObj.innerHTML += finalHtmlStrArr.shift();
                        //设置table的配置
                        _this.set_configToTable(shortTimeTableObj,configDataObj);
                        //将tableObj存入数组
                        finalTableArr[tableId].push(shortTimeTableObj);
                        shortTimeTableObj = null;
                        //下标数值 + 1
                        tablePartIndex += 1;
                        if(finalHtmlStrArr.length == 0){
                            isSendOver = true;
                            // console.timeEnd('写入时长');
                            finalHtmlStrArr = null;
                            clearInterval(saveTableDataTime);
                        }
                    },pageRunTime + 10);
                }else {
                    isSendOver = true;
                }
            }
            //重写完数据
            isReSetData = false;
        };
    };

    /**
     * 函数：用于为table节点插入列宽控制标签col
     */
    function appendColNode(tableId,tablePart,widthData) {
        //新建一个colgroup节点
        let colGroup;
        //存储col标签字符串
        let colStr = '';
        //获取旧colGroup节点
        let oldColGroupNode;
        //获取col的宽度总和
        let colWidth = 0;
        //获取表头区域
        let tableTitleArea = document.getElementById(tableId).getElementsByClassName('_qd_tableTitleDiv')[0];
        //获取表头table集合
        let titleTableArr = tableTitleArea.getElementsByTagName('table');
        //若展示表序号配置数据存在
        if(configDataArr[tableId].showTableNumber !== undefined){
            //若展示表序号列
            if(configDataArr[tableId].showTableNumber.isShow){
                //遍历添加col标签
                for(let index = 0; index < 2; index ++){
                    colStr += colHtml.replace('/>','width="51px"/>');
                }
            }else {
                colStr += colHtml.replace('/>','width="51px"/>');
            }
        }else {
            //遍历添加col标签
            for(let index = 0; index < 2; index ++){
                colStr += colHtml.replace('/>','width="51px"/>');
            }
        }
        if(titleTableArr.length > 0){
            //获取colWidth
            for(let index in titleTableArr){
                if(!isNaN(index) && titleTableArr[index].className.indexOf('_global_displayNone') < 0){
                    colWidth = titleTableArr[index].offsetWidth;
                }
            }
        }
        //遍历宽度数据添加col标签
        Object.keys(widthData).forEach(function (key) {
            if(widthData[key] == null){
                colStr += colHtml.replace('/>','name="'+ key +'"/>');
                if(colWidth !== undefined){
                    colWidth = undefined;
                }
            }else {
                colStr += colHtml.replace('/>','name="'+ key +'" width="'+ widthData[key] +'px"/>');
            }
        });
        oldColGroupNode = tablePart.getElementsByTagName('colgroup');
        //若存在就colgroup
        if(oldColGroupNode.length > 0){
            //更新col节点
            oldColGroupNode[0].innerHTML = colStr;
        }else {
            colGroup = document.createElement('COLGROUP');
            //将修改后的colStr插入到colGroup中
            colGroup.innerHTML = colStr;
            //将colGroup插入到tablePart中
            tablePart.appendChild(colGroup);
        }
        if(colWidth){
            //改变tablePart的宽度
            tablePart.style.width = colWidth + 'px';
        }else {
            //改变tablePart的宽度
            tablePart.style.width = '';
        }
    }

    /**
     * 函数：获取表格各列的宽度数据
     */
    function getColWidth(tableId){
        //获取配置数据
        let configData = configDataArr[tableId];
        //获取列宽数据
        let colWidthData = {};
        //暂时存储
        let shortTimeSave;
        //获取数据源的子项中各属性名集合
        let allAttrNameArr = [];
        //自定义表头数据存在
        if(configData.rewriteTableTitle !== undefined && configData.rewriteTableTitle.diyTitleData !== undefined){
            //获取自定义表头的配置数据
            shortTimeSave = configData.rewriteTableTitle.diyTitleData;
            //提取自定义头部列宽
            diyTitleColumnWidthArr(shortTimeSave,colWidthData);
        }else {//自定义表头的配置数据不存在
            //获取表头区域中的table
            let tableTitleNode = document.getElementById(tableId).getElementsByClassName('_qd_tableTitleDiv')[0].getElementsByTagName('table')[0];
            //若这个table存在
            if(tableTitleNode){
                //获取th集合
                let thArr = tableTitleNode.getElementsByTagName('th');
                //若allAttrNameArr为数组
                if(allAttrNameArr instanceof Array){
                    allAttrNameArr = {};
                }
                //遍历thArr集合
                for(let index in thArr){
                    if(!isNaN(index) && thArr[index].className.indexOf('_global_displayNone') < 0 && thArr[index].getAttribute('attrname')){
                        //获取属性名
                        shortTimeSave = thArr[index].getAttribute('attrname');
                        //获取th的实际宽度
                        allAttrNameArr[shortTimeSave] = thArr[index].offsetWidth;
                    }
                }
            }else if(configData.showColumn !== undefined && configData.showColumn.attrNameArr !== undefined){//若showColumn数据存在
                //若展示列数据是all，要先将列排序数据写入allAttrNameArr，后将展示列数据补写进allAttrNameArr
                if(configData.showColumn.attrNameArr == 'all'){
                    //若数据源不为空
                    if(dataSourceArr[tableId].length > 0){
                        //若列排序数据存在
                        if(configData.setColumnOrder !== undefined && configData.setColumnOrder.columnOrder !== undefined){
                            //获取列排序数据
                            shortTimeSave = configData.setColumnOrder.columnOrder;
                            //遍历排列数据
                            shortTimeSave.forEach(function (key) {
                                //存入属性名数组
                                allAttrNameArr.push(key);
                            })
                        }
                        //存储数据源的子项
                        shortTimeSave = dataSourceArr[tableId][0];
                        if(shortTimeSave !== undefined){
                            //遍历获取数据源子项中的所有属性名
                            Object.keys(shortTimeSave).forEach(function (key) {
                                //若key在数组中不存在
                                if(_this.inArray(key,allAttrNameArr) < 0){
                                    allAttrNameArr.push(key);
                                }
                            });
                        }
                    }
                }else {//当展示列数据不是all
                    //初始化shortTimeSave;
                    if(allAttrNameArr === undefined || allAttrNameArr.length != 0){
                        allAttrNameArr = [];
                    }
                    let showColData = configData.showColumn.attrNameArr;
                    //若列顺序数据存在,要先将列排序数据（在展示列数据中存在）写入allAttrNameArr，后将展示列数据补写进allAttrNameArr
                    if(configData.setColumnOrder !== undefined && configData.setColumnOrder.columnOrder !== undefined){
                        //整合展示列数据和列排序数据
                        let colOrderData = configData.setColumnOrder.columnOrder;
                        //遍历顺序数据
                        colOrderData.forEach(function (key) {
                            //若在展示数据中存在
                            if(_this.inArray(key,showColData) > -1){
                                allAttrNameArr.push(key);
                            }
                        });
                        //遍历列展示数据
                        showColData.forEach(function (key) {
                            //若allAttrNameArr中不存在
                            if(_this.inArray(key,allAttrNameArr) < 0){
                                allAttrNameArr.push(key);
                            }
                        })
                    }else {//若列顺序数据不存在
                        //遍历展示列数据
                        allAttrNameArr = showColData;
                    }
                }
            }else {
                console.error('无法生成列宽数据');
            }
            if(allAttrNameArr instanceof Array){
                if(allAttrNameArr.length > 0){
                    //遍历属性名数组
                    allAttrNameArr.forEach(function (key) {
                        colWidthData[key] = null;
                    })
                }
            }else {
                if(JSON.stringify(allAttrNameArr) != '{}'){
                    //遍历获取数据
                    Object.keys(allAttrNameArr).forEach(function (name) {
                        colWidthData[name] = allAttrNameArr[name];
                    })
                }
            }
        }
        return colWidthData;
    }

    /**
     * 函数：提取自定义头部的列宽
     */
    function diyTitleColumnWidthArr(diyTitleData,widthData) {
        //遍历自定义表头
        diyTitleData.forEach(function (dataItem) {
            //当width属性存在，则push进数组
            if(dataItem.width !== undefined){
                widthData[dataItem.attrName] = dataItem.width;
            }else {
                //width不存在时,children属性存在就重新调用，没有就push一个null进数组
                if(dataItem.children !== undefined){
                    diyTitleColumnWidthArr(dataItem.children,widthData);
                }else {
                    widthData[dataItem.attrName] = (dataItem.width !== undefined) ? dataItem.width : null;
                }
            }
        });
    }


    /*========================================  * 列排序模块 *  ==========================================*/
    /**
     * 方法：将排序三角符号插入表头
     */
    _this.append_tableTitleTriangle = function (tableObj) {
        let chileNodes;
        let triangleHtml = triangleHTML;
        let triangleNode;
        let nodeTrueHeight;
        let nowAttrName;

        if(tableObj.getElementsByTagName('th').length > 0){
            chileNodes = tableObj.getElementsByTagName('th');
        }else {
            chileNodes = tableObj.getElementsByTagName('td');
        }
        for(let index in chileNodes){
            if(!isNaN(index) && chileNodes[index].getAttribute('attrname')){
                nowAttrName = chileNodes[index].getAttribute('attrname');
                nodeTrueHeight = chileNodes[index].offsetHeight;
                triangleNode = _this.domNode(triangleHtml)[0];
                // triangleNode.style.height = nodeTrueHeight + 'px';
                // triangleNode.style.marginLeft = '5px';
                chileNodes[index].appendChild(triangleNode);
                if(sortColConfig.attrName !== undefined && sortColConfig.attrName == nowAttrName){
                    if(sortColConfig.sortRule == 'up'){
                        triangleNode.firstElementChild.classList.add('_qd_selUpTriangle');
                    }else {
                        triangleNode.firstElementChild.classList.remove('_qd_tableTitleTriangleUp');
                        triangleNode.firstElementChild.classList.add('_qd_tableTitleTriangleDown','_qd_selDownTriangle');
                    }
                }
                triangleNode = null;
            }
        }
    };

    /**
     * 方法：绑定表头的点击事件
     */
    _this.bind_tableTitleMouseDown = function (tableId) {
        //获取tableId对应的表格区域
        let tableArea = document.getElementById(tableId);
        //获取表头区域
        let tableTitleArea = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0];
        //获取表头区域的直接子节点
        let childNodes = tableTitleArea.children;
        //获取table的数量
        let tableNum = 0;
        //存储当前作用的table
        let titleTable;
        //获取当前点击节点
        let nowActNode;
        //获取排序作用节点
        let sortNode;

        //获取table的数量
        for(let index in childNodes){
            if(!isNaN(index) && childNodes[index].tagName.toLowerCase() == 'table'){
                tableNum += 1;
            }
        }
        //若tableNum>1则作用table为自定义表头，反之为原表头
        if(tableNum > 1){
            for(let index in childNodes){
                if(!isNaN(index) && childNodes[index].tagName.toLowerCase() == 'table' && childNodes[index].className.indexOf('_qd_newTableTitle') > -1){
                    titleTable = childNodes[index];
                    break;
                }
            }
        }else {
            for(let index in childNodes){
                if(!isNaN(index) && childNodes[index].tagName.toLowerCase() == 'table' && childNodes[index].className.indexOf('_qd_tableSize') > -1){
                    titleTable = childNodes[index];
                    break;
                }
            }
        }

        titleTable.addEventListener('mousedown',function (event) {
            event = event || window.event;
            nowActNode = event.target;
            if(nowActNode && event.button == 0){
                if(nowActNode.tagName.toLowerCase() == 'td' || nowActNode.tagName.toLowerCase() == 'th' || nowActNode.className.indexOf('_qd_tableTitleTriangleDiv') > -1){
                    if(nowActNode.tagName.toLowerCase() == 'div'){
                        sortNode = nowActNode.parentNode;
                    }else{
                        sortNode = nowActNode;
                    }
                    _this.event_tableTitleMouseDown(tableId,sortNode)
                }
            }
        })
    };

    /**
     * 方法：表头的点击事件
     */
    _this.event_tableTitleMouseDown = function (tableId,sortNode) {
        let nowAttrName;
        let newDataSource;
        //必须有attrName的节点才执行下列代码
        if(sortNode && sortNode.getAttribute('attrname')){
            isColSort = true;
            nowAttrName = sortNode.getAttribute('attrname');
            if(sortColConfig.attrName !== undefined){
                if(sortColConfig.attrName == nowAttrName){
                    if(sortColConfig.sortRule == 'up'){
                        sortColConfig.sortRule = 'down';
                        newDataSource = _this.sort_tableData(tableId,nowAttrName,sortColConfig.sortRule);
                    }else {
                        sortColConfig.sortRule = 'up';
                        newDataSource = _this.sort_tableData(tableId,nowAttrName,sortColConfig.sortRule);
                    }
                }else {
                    sortColConfig.attrName = nowAttrName;
                    sortColConfig.sortRule = 'up';
                    newDataSource = _this.sort_tableData(tableId,nowAttrName,sortColConfig.sortRule);
                }
            }else {
                sortColConfig.attrName = nowAttrName;
                sortColConfig.sortRule = 'up';
                newDataSource = _this.sort_tableData(tableId,nowAttrName,sortColConfig.sortRule);
            }
            _this.reset_data(tableId,newDataSource,configDataArr[tableId]);
        }
    };

    /**
     * 方法：根据排序的规则将数据源排序并重写
     */
    _this.sort_tableData = function (tableId,attrName,sortRule) {
        //获取当前的数据源
        let nowData = dataSourceArr[tableId];
        //存储中间数
        let midAmount;
        //存储下标集合
        let indexArr;
        //存储下标中间数
        let midIndex;
        //若下标集合为空，则根据数据源生成集合
        if(sortIndexArr[tableId].length == 0){
            nowData.forEach(function (item,index) {
                sortIndexArr[tableId].push(index);
            })
        }
        indexArr = sortIndexArr[tableId];
        //根据条件排序1
        /*if(sortRule == 'up'){
            for(let len = nowData.length;len > 1;len --){
                for (let index = 0 ; index < len - 1; index++) {
                    if (nowData[index][attrName] > nowData[index + 1][attrName]) {
                        //交换子项
                        midAmount = nowData[index];
                        nowData[index] = nowData[index + 1];
                        nowData[index + 1] = midAmount;
                        //交换下标
                        midIndex = indexArr[index];
                        indexArr[index] = indexArr[index + 1];
                        indexArr[index + 1] = midIndex;
                    }
                }
            }
        }else {
            for(let len = nowData.length;len > 1;len --){
                for (let index = 0 ; index < len - 1; index++) {
                    if (nowData[index][attrName] < nowData[index + 1][attrName]) {
                        //交换子项
                        midAmount = nowData[index];
                        nowData[index] = nowData[index + 1];
                        nowData[index + 1] = midAmount;
                        //交换下标
                        midIndex = indexArr[index];
                        indexArr[index] = indexArr[index + 1];
                        indexArr[index + 1] = midIndex;
                    }
                }
            }
        }*/
        //根据条件排序2
        nowData.sort(function (item1,item2) {
            if(sortRule == 'up'){
                //正排序
                return (item1[attrName] < item2[attrName]) ? -1 : (item1[attrName] == item2[attrName]) ? 0 : 1;
            }else {
                //逆排序
                return (item1[attrName] < item2[attrName]) ? 1 : (item1[attrName] == item2[attrName]) ? 0 : -1;
            }
        });
        //返回排序后的数据源
        return nowData;
    };

    /*========================================  * 自定义表头模块 *  ==========================================*/
    /**
     * 方法：用于生成自定义表头
     */
    _this.recreate_tableTitle = function (newTableTitleObj,diyTitleData,levelIndex) {
        //定义td的html
        let tdHTml = '<td></td>';
        //获取新表头中的tr集合
        let trArr = newTableTitleObj.getElementsByTagName('tr');
        //存储新建的tr节点对象
        let newTrObj;
        //存储新建的td节点对象
        let newTdObj;
        //获取当前行中所有的td集合
        let tdArr;
        //获取要跨的行数
        let colSpanNum;
        //获取旧表头
        let oldTitleObj;
        //获取旧表头的tr节点对象
        let oldTitleTrObj;
        //定义th的查询规则
        let thRule;
        //存储旧表头的th集合
        let oldTitleThArr;
        //存储复选框+序号这两个html
        let newInnerHtml;
        //存储跨列数
        let childrenCols;
        //当新表头里tr的数量小于当前levelIndex,则新建tr节点
        if(trArr.length < levelIndex){
            //新建tr节点
            newTrObj = _this.domNode(newTableTitleTrHtml)[0];
            //设置tr的顺序
            newTrObj.setAttribute('level',levelIndex);
            //保证所有tr插入到tbody标签中
            if(newTableTitleObj.getElementsByTagName('tbody').length != 0){
                newTableTitleObj.getElementsByTagName('tbody')[0].appendChild(newTrObj);
            }else {
                newTableTitleObj.appendChild(newTrObj);
            }
            newTrObj = null;
        }
        //若当前行是表头的第一行且没有复选框时
        if(levelIndex == 1 && newTableTitleObj.getElementsByTagName('input').length == 0){
            //初始化
            newInnerHtml = '';
            //定义查找正则表达式
            thRule = /<th[^>]+_qd_headColumn[^>]+>((?!<\/th>).)*<\/th>/g;
            //获取旧表头
            oldTitleObj = newTableTitleObj.previousElementSibling;
            //获取旧表头中的行
            oldTitleTrObj = oldTitleObj.getElementsByTagName('tr')[0];
            //获取复选框+序号的thHtml;
            oldTitleThArr = oldTitleTrObj.innerHTML.match(thRule);
            //将th替换为td并赋给newInnerHtml；
            for(let thKey in oldTitleThArr){
                if(!isNaN(thKey)){
                    newInnerHtml += oldTitleThArr[thKey].replace('<th','<td').replace('</th>','</td>');
                }
            }
            //将复选框+序号插入自定义表头的第一行
            newTableTitleObj.getElementsByTagName('tr')[0].innerHTML = newInnerHtml;
            //释放内存
            oldTitleTrObj = null;
            oldTitleObj = null;
            oldTitleThArr = null;
        }
        //根据自定义表头数据进行表格生成
        diyTitleData.forEach(function (item) {
            //初始化跨列数
            childrenCols = 0;
            //新建td节点对象
            newTdObj = _this.domNode(tdHTml)[0];
            //插入名称
            newTdObj.innerText = item.name;
            //若有children属性，重调本函数
            if(item.children !== undefined){
                childrenCols += _this.get_childrenColsNum(item.children);
                //当前td设置跨行
                newTdObj.setAttribute('colspan',childrenCols);
                //重调本函数
                _this.recreate_tableTitle(newTableTitleObj,item.children,levelIndex + 1);
            }else {
                //没有就根据width属性设置td的宽度
                /*if(item.width != null && item.width !== undefined){
                    newTdObj.style.width = parseInt(item.width) + 'px';
                }*/
                //若数据中存在attrName，且不存在children的时候
                if(item.attrName !== undefined){
                    newTdObj.setAttribute('attrname',item.attrName);
                }
            }
            //将td插入当前行
            trArr[levelIndex - 1].appendChild(newTdObj);
            newTdObj = null;
        });
        //将当前tr行里的所有td进行跨行和跨列判断
        tdArr = newTableTitleObj.getElementsByTagName('td');
        for(let index in tdArr){
            if(!isNaN(index)){
                colSpanNum = tdArr[index].getAttribute('colspan');
                if(!Boolean(colSpanNum)){
                    tdArr[index].setAttribute('rowspan',trArr.length - parseInt(tdArr[index].parentNode.getAttribute('level')) + 1);
                }
            }
        }
        tdArr = null;
        trArr = null;
    };

    /**
     * 方法：用于提取跨列数
     */
    _this.get_childrenColsNum = function (data) {
        let num = 0;
        //一切以最底层的列数为准，防止多获取了中间的列数而造成误差
        data.forEach(function (item) {
            //当有子项时，获取子项的个数
            if (item.children !== undefined){
                num += _this.get_childrenColsNum(item.children);
            }else {
                //没有子项，就以自身看成子项 + 1
                num += 1;
            }
        });
        return num
    };

    /*========================================  * 功能按钮模块 *  ==========================================*/
    /**
     * 方法：修改功能按钮区域
     */
    _this.rewrite_funBtnArea = function (tableArea,rewriteDataObj) {
        //获取功能按钮区域
        let funBtnArea = tableArea.firstElementChild;
        //是否清楚所有按钮
        let isCleanAll = rewriteDataObj.isCleanAll;
        //获取要写入功能按钮去的htmlStr
        let htmlStr = rewriteDataObj.htmlStr;
        //获取将htmlStr转换成的节点集合
        // let newNodeArr;
        //创建新节点
        // newNodeArr = _this.domNode(htmlStr);
        //是否情况功能按钮区域
        if (isCleanAll){
            funBtnArea.childNodes[0].innerHTML = '';
        }
        htmlStr.forEach(function (btnHtml) {
            funBtnArea.childNodes[0].appendChild(_this.domNode(btnHtml)[0]);
        });
        //插入功能按钮
        // newNodeArr.forEach(function (newNode) {
        //     funBtnArea.childNodes[0].appendChild(newNode);
        // });
        tableArea = null;
        rewriteDataObj = null;
    };

    /**
     * 方法：生成功能按钮区并绑定点击事件
     */
    _this.create_funBtnDiv = function (tableId) {
        //默认的功能按钮名称数组
        let funArr = ['添加','删除','批量修改'];
        //对应的按钮颜色的数组
        let colorArr = ['#00aaff','#ff0000','#FFA500'];
        //按钮功能属性的值的数组
        let funAttrArr = ['add','delete','modify'];
        //新建功能区域
        let funBtnDiv = document.createElement('div');
        //存储按钮的html
        let btnStr = '';
        //获取全局功能按钮的html
        let btnHTML = funBtnHTML;
        //获取当前tableFather区域
        let tableArea = document.getElementById(tableId);
        //新建功能按钮承载框
        let btnDiv = '<div class="_qd_funBtnDiv"></div>';
        //生成默认按钮
        funArr.forEach(function (item,index) {
            btnStr += btnHTML.replace('></button>',function () {
                return 'style="background-color:' + colorArr[index] + ';" funName="'+ funAttrArr[index] +'"></button>';
            }).replace('</button>',item + '</button>');
        });

        //给功能按钮区设置属性
        funBtnDiv.classList.add('_qd_funBtnDivSize');
        funBtnDiv.setAttribute('name','qd-tableFunArea');
        //写入按钮的html
        funBtnDiv.innerHTML = btnDiv.replace('</div>',btnStr + '</div>');
        //插入功能按钮区域
        tableArea.insertBefore(funBtnDiv,tableArea.firstElementChild);
        //绑定功能按钮区域的点击事件
        _this.mouseUp_funBtnDiv(tableId);
    };

    /**
     * 方法：绑定功能按钮区中所有默认按钮的点击事件
     * 修改：需要将各个按钮的点击事件独立出一个接口给开发者调用（已完成）
     */
    _this.mouseUp_funBtnDiv = function (tableId) {
        let tableArea = document.getElementById(tableId);
        let funBtnDivObj = tableArea.getElementsByClassName('_qd_funBtnDivSize')[0];
        let tableContentDiv = tableArea.getElementsByClassName('_qd_tableContentDiv')[0];
        let actBtnObj;
        let isOpen = true;
        //作为函数名
        let funBtnEvent;
        //所有会改动到片段数量或行数的都必须先将线程数据全部加载完成
        funBtnDivObj.addEventListener('mouseup',funBtnEvent = function(event){
            if(event.target && event.button == 0 && event.target.tagName.toLowerCase() == 'button'){
                actBtnObj = event.target;
                switch (actBtnObj.getAttribute('funName')){
                    case 'add':
                        if(isOpen){
                            if(isSendOver){
                                _this.add_newDataItem(tableContentDiv,tableId);
                            }else {
                                _this.show_loadingPage(true,'正在写入余下的数据，请稍后');
                                sendOverTime = setInterval(function () {
                                    if(isSendOver){
                                        _this.show_loadingPage(false);
                                        _this.add_newDataItem(tableContentDiv,tableId);
                                        clearInterval(sendOverTime);
                                    }
                                },500)
                            }
                        }else {
                            alert('未开放使用');
                        }
                        break;
                    case 'delete':
                        if(isOpen){
                            if(isSendOver){
                                _this.remove_dataItem(tableContentDiv,tableId);
                            }else {
                                _this.show_loadingPage(true,'正在写入余下的数据，请稍后');
                                sendOverTime = setInterval(function () {
                                    if(isSendOver){
                                        _this.show_loadingPage(false);
                                        _this.remove_dataItem(tableContentDiv,tableId);
                                        clearInterval(sendOverTime);
                                    }
                                },500)
                            }
                        }else {
                            alert('未开放使用');
                        }
                        break;
                    case 'modify':
                        if(isOpen){
                            _this.create_batchEditContent(tableId);
                        }else {
                            alert('未开放使用');
                        }
                        break;
                    default:
                        break;
                }
            }
        });
    };

    /*========================================  * 行添加模块 *  ==========================================*/
    /**
     * 方法：功能按钮区域的添加按钮事件
     */
    _this.add_newDataItem = function (tableContentDiv,tableId,addNum) {
        //获取当前片段展示去中的table集合
        let nowTableArr = [];
        //获取冻结承载框
        let freezeColDiv;
        //当前展示的片段中最后一个的下标
        let nowLastLevelIndex;
        //新建table节点
        let newTable = null;
        //获取要处理的片段下标
        let nowActTablePartIndex;
        //获取经过处理后的片段对象
        let newActTablePartObj;
        //要写入的新html
        let newInnerHtml;
        //存储worker线程回传的htmlStr
        let htmlStrArr = [];
        //获取表头展示去对象
        let tableTitleArea = tableContentDiv.previousElementSibling;
        //存储新添加的数据项
        let newItem = {};
        //获取表头中的th集合
        let thArr;
        //获取表头的属性名称
        let attrName;
        //暂时存储变量
        let shortTimeSave;
        //append函数
        let append;
        //获取新下标
        let newIndex;
        //配置数据
        let config = {};
        //获取展示区中的子项；
        let nodes;
        //获取新的冻结列片段
        let newFreezeColPart;
        //存储新增子项的副本
        let copyDataItem;
        //获取片段中的行数
        let partTrNum;
        //tr行的正则表达式
        let trRule = /<tr[^>]*>((?!<\/tr>).)*<\/tr>/g;
        //获取trHtml集合
        let trHtmlArr;
        //存储片段计数
        let count;
        //存储新增的数据集合
        let newAddItemArr;
        //存储当前所有片段的总高度
        let allPartHeight;
        //获取列宽数据
        let colWidthData = getColWidth(tableId);

        //初始化number值
        addNum = parseInt(addNum) || 1;

        isAddNewTr = true;

        //获取冻结承载框
        freezeColDiv = tableContentDiv.getElementsByTagName('_qd_freColDiv');

        //若冻结承载框存在则清除冻结承载框中的冻结片段
        if(freezeColDiv.length != 0){
            //清空冻结承载框中的内容（在此处删除冻结框中所有内容是为了方便获取展示框中的table片段）
            freezeColDiv[0].innerHTML = ''
        }

        //获取非冻结承载框中的table片段
        nowTableArr = tableContentDiv.getElementsByTagName('table');

        //必须取标题区域的第一个table中的th，自定义和冻结框中的th都不可以
        thArr = tableTitleArea.getElementsByTagName('table')[0].getElementsByTagName('th');
        for (let thKey in thArr){
            if(!isNaN(thKey) && thArr[thKey].getAttribute('attrname')){
                attrName = thArr[thKey].getAttribute('attrname');
                newItem[attrName] = '';
            }
        }
        //获取新子项的下标开端
        newIndex = dataSourceArr[tableId].length;
        //初始化暂时存储数组
        if(newAddItemArr === undefined){
            newAddItemArr = [];
        }
        if(addNum > 1){
            for(let index = 0; index < addNum; index ++){
                copyDataItem = JSON.parse(JSON.stringify(newItem));
                //写入数据源
                dataSourceArr[tableId].push(copyDataItem);
                //存入临时数组
                newAddItemArr.push(copyDataItem);
            }
        }else {
            //写入数据源
            dataSourceArr[tableId].push(newItem);
            //存入临时数组
            newAddItemArr.push(newItem);
        }
        //获取混合数据
        config.dataSource = newAddItemArr;
        config.configData = configDataArr[tableId];
        //传入数据
        worker.postMessage(config);
        //接收数据
        worker.addEventListener('message',append = function(event) {
            if(!isAddNewTr){
                return;
            }
            if(event.data != 'over'){
                htmlStrArr.push(event.data)
            }else {
                isAddNewTr = false;
                //获取返回的htmlStr
                if(newInnerHtml === undefined){
                    newInnerHtml = '';
                }
                //将返回值中非头部的html拼接起立(0是片段数，1是头部html);
                for(let index = 2; index < htmlStrArr.length; index ++){
                    newInnerHtml += htmlStrArr[index];
                }
                // newInnerHtml = htmlStrArr.pop();
                //释放内存
                htmlStrArr = null;
                //修改新序号
                newInnerHtml = newInnerHtml.replace(/<td[^>]+dataItemId[^>]+>((?!<\/td>).)*<\/td>/g,function(tdStr){
                    //序号+偏移值
                    newIndex += differentValue;
                    return tdStr.match(/<td[^>]+>/)[0] + newIndex + '</td>';
                });
                //获取trHtml的集合
                trHtmlArr = newInnerHtml.match(trRule);
                //展开loading页面
                _this.show_loadingPage(true,'正在添加新数据');
                //当展示区域的table个数不为0时
                if(nowTableArr.length != 0){
                    //获取当前最后一个片段的下标
                    nowLastLevelIndex = parseInt(nowTableArr[nowTableArr.length - 1].getAttribute('levelindex'));
                    //获取最后一个table片段的下标
                    nowActTablePartIndex = finalTableArr[tableId].length - 1;
                    //需要先处理最后一个片段里的行数（例：删除行数和改变序号）这里不用插入页面的原因：后面分‘分页和不分页’时会插入
                    newActTablePartObj = _this.dealWith_tablePart(tableId, nowActTablePartIndex, 'before');
                    //要预防处理后没有table片段剩余的情况
                    if(newActTablePartObj != null){
                        //获取最后一个片段中的行数
                        partTrNum = newActTablePartObj.getElementsByTagName('tr').length;
                    }else {
                        partTrNum = 0;
                    }
                    //若当前页面的最后一个片段不为片段数组中最后一个片段时清空当前页面中的片段
                    if(nowLastLevelIndex != finalTableArr[tableId].length - 1){
                        //遍历移除当前所有table片段
                        while (nowTableArr.length > 0){
                            tableContentDiv.removeChild(nowTableArr[0]);
                        }
                    }
                    /*//若当前最后一个table片段不为集合里的最后一个片段
                    if(nowLastLevelIndex != finalTableArr[tableId].length -1){
                        //获取最后一个table片段的下标
                        nowActTablePartIndex = finalTableArr[tableId].length - 1;
                        //需要先处理最后一个片段里的行数（例：删除行数和改变序号）这里不用插入页面的原因：后面分‘分页和不分页’时会插入
                        newActTablePartObj = _this.dealWith_tablePart(tableId, nowActTablePartIndex, 'before');
                        //要预防处理后没有table片段剩余的情况
                        if(newActTablePartObj != null){
                            //获取最后一个片段中的行数
                            partTrNum = newActTablePartObj.getElementsByTagName('tr').length;
                        }else {
                            partTrNum = 0;
                        }
                    }else {
                        //获取最后一个片段中的行数
                        partTrNum = nowTableArr[nowTableArr.length - 1].getElementsByTagName('tr').length;
                        //将最后一个片段赋值给newActTablePartObj
                        newActTablePartObj = nowTableArr[nowTableArr.length - 1];
                    }*/
                    //若新增行数超过规定的片段截取行数
                    if(partTrNum + addNum > cutNum){
                        //遍历移除当前所有table片段
                        while (nowTableArr.length > 0){
                            tableContentDiv.removeChild(nowTableArr[0]);
                        }
                        //清空newInnerHtml
                        newInnerHtml = '';
                        //暂时存储cutNun与partTrNum的差值,记录差多少行满一片段
                        shortTimeSave = cutNum - partTrNum;
                        //根据差值将部分trHtml插入最后的片段中
                        while (shortTimeSave > 0){
                            //删除提取集合中的第一子项并将其拼接入newInnerHtml;
                            newInnerHtml += trHtmlArr.shift();
                            //循环标志 - 1;
                            shortTimeSave -= 1;
                        }
                        if(newInnerHtml != ''){
                            // 若当前片段中存在tbody时
                            if(newActTablePartObj.getElementsByTagName('tbody').length != 0){
                                //将最后的table片段补全
                                newActTablePartObj.getElementsByTagName('tbody')[0].innerHTML += newInnerHtml;
                            }else {
                                // 将新片段插入最后的table片段中
                                newActTablePartObj.innerHTML += newInnerHtml;
                            }
                        }
                        //计算剩余trHtml所能形成的新片段数
                        shortTimeSave = (trHtmlArr.length % cutNum > 0) ? parseInt(trHtmlArr.length/cutNum) + 1 : parseInt(trHtmlArr.length/cutNum);
                        //根据新片段数生成新的table片段
                        while (shortTimeSave > 0){
                            //保证新增了table片段的同时删除集合得到扩充
                            if(deleteItem !== undefined && deleteItem[tableId] !== undefined){
                                deleteItem[tableId][finalTableArr[tableId].length] = [];
                            }
                            //保证新增了table片段的同时批量修改集合得到扩充
                            if(batchEditItemDataArr !== undefined && batchEditItemDataArr[tableId] !== undefined){
                                batchEditItemDataArr[tableId][finalTableArr[tableId].length] = [];
                            }
                            //新建table节点
                            newTable = document.createElement('table');
                            //插入col标签
                            appendColNode(tableId,newTable,colWidthData);
                            //初始化默认table样式
                            _this.table_init(newTable);
                            //设置table的在集合中的下标
                            newTable.setAttribute('levelindex',finalTableArr[tableId].length);
                            //当前先调整要插入table样式
                            _this.set_configToTable(newTable,configDataArr[tableId]);
                            //记录片段的截取行数
                            count = (trHtmlArr.length > cutNum) ? cutNum : trHtmlArr.length;
                            //清空插入trHtml
                            newInnerHtml = '';
                            //根据计数获取新插入片段
                            while (count > 0){
                                //删除提取trHtml集合中的第一子项
                                newInnerHtml += trHtmlArr.shift();
                                //计数 - 1;
                                count -= 1;
                            }
                            //插入新table中的内容
                            newTable.innerHTML += newInnerHtml;
                            //将新table存储进finalTableArr
                            finalTableArr[tableId].push(newTable);
                            //片段数标志 - 1
                            shortTimeSave -= 1;
                        }
                    }else {//当新增加的行数与末尾片段的行数和不超过分段数时
                        //清空newInnerHtml
                        newInnerHtml = '';
                        //根据trHtml的个数生成插入Html
                        while (trHtmlArr.length > 0){
                            //删除提取trHtml集合的第一子项并拼接
                            newInnerHtml += trHtmlArr.shift();
                        }
                        // 若当前片段中存在tbody时
                        if(newActTablePartObj.getElementsByTagName('tbody').length != 0){
                            //将最后的table片段补全
                            newActTablePartObj.getElementsByTagName('tbody')[0].innerHTML += newInnerHtml;
                        }else {
                            //将新片段插入最后的table片段中
                            newActTablePartObj.innerHTML += newInnerHtml;
                        }
                    }
                }else {
                    //计算新增行能添加的新片段数
                    shortTimeSave = (addNum % cutNum > 0) ? parseInt(addNum/cutNum) + 1 : parseInt(addNum/cutNum);
                    //根据新片段数建立新的table片段
                    while (shortTimeSave > 0){
                        //新增删除的关键信息
                        deleteItem[tableId][finalTableArr[tableId].length] = [];
                        //新增批量修改的关键信息
                        batchEditItemDataArr[tableId][finalTableArr[tableId].length] = [];
                        //新建table节点
                        newTable = document.createElement('table');
                        //插入col标签
                        appendColNode(tableId,newTable,colWidthData);
                        //初始化默认table样式
                        _this.table_init(newTable);
                        //设置table的在集合中的下标
                        newTable.setAttribute('levelindex',finalTableArr[tableId].length);
                        //当前先调整要插入table样式
                        _this.set_configToTable(newTable,configDataArr[tableId]);
                        //记录片段的截取行数
                        count = (trHtmlArr.length > cutNum) ? cutNum : trHtmlArr.length;
                        //清空插入trHtml
                        newInnerHtml = '';
                        //根据计数获取新插入片段
                        while (count > 0){
                            //删除提取trHtml集合中的第一子项
                            newInnerHtml += trHtmlArr.shift();
                            //计数 - 1;
                            count -= 1;
                        }
                        //插入新table中的内容
                        newTable.innerHTML += newInnerHtml;
                        //将新table存储进finalTableArr
                        finalTableArr[tableId].push(newTable);
                        //片段数标志 - 1
                        shortTimeSave -= 1;
                    }
                }

                //将新生成的片段根据模式插入到页面中
                if(nowTableArr.length == 0){
                    //若需要分页
                    if(isPaging){
                        //获取最后片段的下标
                        nowActTablePartIndex = finalTableArr[tableId].length - 1;
                        //获取并处理最后的table片段,在后面会处理列宽
                        newActTablePartObj = finalTableArr[tableId][nowActTablePartIndex];
                        //若冻结承载框存在
                        if(freezeColDiv.length > 0){
                            //在冻结承载框前插入
                            tableContentDiv.insertBefore(newActTablePartObj,freezeColDiv[0]);
                        }else {
                            //直接在最后插入
                            tableContentDiv.appendChild(newActTablePartObj);
                        }
                        //修改新片段中节点的宽度(需要确保要修改的片段已经插入到文档中)
                        _this.reset_tableChildNodeWidth(tableId,newActTablePartObj);
                        //更新片段数
                        pageNum[tableId] = finalTableArr[tableId].length;
                        //更新分页信息行(分页数，当前tableId,初始化显示页码)
                        _this.init_tablePage(pageNum[tableId],tableId,pageNum[tableId]);
                    }else {
                        //获取最后片段的下标
                        nowActTablePartIndex = finalTableArr[tableId].length - 1;
                        //当没有滚动条时，一直添加table片段直到出现滚动条或者片段都被便利完了
                        while (tableContentDiv.clientWidth == tableContentDiv.offsetWidth){
                            //对片段集合进行处理并获取返回的片段，这里需要处理方法的原因：当出现滚动条之前插入的片段有可能不是新生成的片段，所以需要处理方法进行处理
                            newActTablePartObj = _this.dealWith_tablePart(tableId, nowActTablePartIndex, 'before');
                            //若返回的片段存在
                            if(newActTablePartObj !== null){
                                //若冻结承载框存在
                                if(freezeColDiv.length > 0){
                                    //若展示去的table片段存在（利用了nowTableArr会根据table片段数的变化而变化的特性）
                                    if(nowTableArr.length > 0){
                                        //将新片段插到最前一个table片段之前
                                        tableContentDiv.insertBefore(newActTablePartObj,nowTableArr[0]);
                                    }else {
                                        //将新片段插入到冻结承载框之前
                                        tableContentDiv.insertBefore(newActTablePartObj,freezeColDiv[0]);
                                    }
                                }else {
                                    //若展示区中已存在table片段
                                    if(nowTableArr.length > 0){
                                        //将新片段插到最前一个table片段之前
                                        tableContentDiv.insertBefore(newActTablePartObj,nowTableArr[0]);
                                    }else {
                                        //将新片段插到最后
                                        tableContentDiv.appendChild(newActTablePartObj);
                                    }
                                }
                                //获取上一个插入片段的前一个片段的下标
                                nowActTablePartIndex = parseInt(newActTablePartObj.getAttribute('levelindex')) - 1;
                            }else{
                                //若没有找到合适（有内容）的table片段，则跳出这个循环
                                break;
                            }
                        }
                    }
                }
                //若出现滚动条，则需要将滚动条滚到最后（这里无需判定是否分页，因为根据浏览器的分辨率不同，分页也有可能出现滚动条）
                if(tableContentDiv.clientWidth != tableContentDiv.offsetWidth){
                    console.log('我出现滚动条');
                    //获取片段集合
                    let tableArr = finalTableArr[tableId];
                    //获取片段数
                    let tableNum = tableArr.length;
                    //获取表头区域内的所有table
                    let titleTableArr = tableTitleArea.getElementsByTagName('table');
                    //表头table的实际宽度
                    let titleTableWidth;
                    //获取滚动条宽度
                    contentAreaScrollDivWidth = tableContentDiv.offsetWidth - tableContentDiv.clientWidth;
                    //修改表头宽度
                    for(let index in titleTableArr){
                        if(!isNaN(index) && titleTableArr[index].className.indexOf('_global_displayNone') < 0){
                            //若表头已经设置过宽度（初始化时设置或拖拽时设置）;
                            if(titleTableArr[index].style.width){
                                titleTableWidth = titleTableArr[index].offsetWidth;
                            }else {
                                titleTableWidth = titleTableArr[index].offsetWidth - contentAreaScrollDivWidth;
                                titleTableArr[index].style.width = titleTableWidth + 'px';
                            }
                            break;
                        }
                    }
                    tableContentDiv.style.width = titleTableWidth + contentAreaScrollDivWidth + 'px';
                    //获取新的列宽数据
                    // colWidthData = getColWidth(tableId);
                    //当超出宽度执行代码
                    while(tableNum > 0 && tableArr[tableNum - 1].offsetWidth > tableContentDiv.clientWidth ){
                        //插入col标签
                        appendColNode(tableId,tableArr[tableNum - 1],colWidthData);
                        //片段数 - 1
                        tableNum -= 1;
                    }
                    //初始化总高度
                    if(allPartHeight === undefined){
                        allPartHeight = 0;
                    }
                    //获取所有片段的总高度
                    for(let index in nowTableArr){
                        if(!isNaN(index)){
                            allPartHeight += nowTableArr[index].offsetHeight;
                        }
                    }
                    //需不需要滚动事件
                    //将滚动条滚到最后
                    tableContentDiv.scrollTop = allPartHeight - tableContentDiv.clientHeight;
                }
                //当冻结承载框存在时,这里为重写冻结列
                if(freezeColDiv.length != 0){
                    //获取展示去中的子标签
                    // nodes = tableContentDiv.children;
                    //将其中的所有table片段转化为冻结片段进行插入
                    for(let nodeIndex in nodes){
                        if(!isNaN(nodeIndex) && nodes[nodeIndex].tagName.toLowerCase() == 'table'){
                            //获取新的冻结片段
                            newFreezeColPart = _this.get_freezeContentColPart(tableId,nodes[nodeIndex]);
                            //将新的冻结片段插入承载框
                            freezeColDiv[0].appendChild(newFreezeColPart);
                            //释放内存
                            newFreezeColPart = null;
                        }
                    }
                }
                //隐藏loading
                _this.show_loadingPage(false);

                //若回调函数不为空则调用。
                if(addMethodCallBack != null){
                    addMethodCallBack(newAddItemArr);
                }
                //清楚worker的message监听事件，以防事件叠加（onxxx的事件会覆盖前一个事件，而EventListener不会覆盖前一个监听）
                worker.removeEventListener('message',append);
            }
        });
    };

    /*========================================  * 行删除模块 *  ==========================================*/
    /**
     * 方法：功能按钮区域的删除按钮事件
     */
    _this.remove_dataItem = function (tableContentArea,tableId) {
        //判定是否执行删除
        let isDelete;
        //当前展示区域中所有的片段
        let nowTableArr = [];
        //获取冻结承载框
        let freezeColDiv;
        //删除下标集合与片段之间的关键信息
        let linkInfo;
        //当前的数据源
        let nowDataSource;
        //存储新显示片段对应的页码
        let newPageIndex;
        //存储作用的片段下标
        let actPartIndex;
        //存储处理后的片段
        let newActPart;
        //存储当前qd-table区域内所有的table
        let allTableArr;
        //传给回调函数的删除下标数组
        let trueDelIndexArr = [];
        //获取展示区的直接节点
        let nodes;
        //获取新冻结片段
        let newFreezeColPart;
        //获取要插入的片段
        let newAppendPart;
        //获取要回传的删除下标数组
        let returnDelIndexArr = [];
        //获取表头区域
        let tableTitleArea = tableContentArea.previousElementSibling;

        if(selectTrIndexArr[tableId].length == 0){
            alert('请勾选要删除的行');
            return;
        }
        //判断是否删除
        isDelete = window.confirm('是否要删除数据？');
        //确定删除
        if(isDelete){
            //展开loading页面
            _this.show_loadingPage(true);
            //获取冻结承载框
            freezeColDiv = tableContentArea.getElementsByClassName('_qd_freColDiv');
            //sort_array
            //排序，从大到小排序
            selectTrIndexArr[tableId].sort(function (a,b) {
                return b - a;
            });
            //当删除行数等于原数据的子项数（即全删除）
            if(selectTrIndexArr[tableId].length == dataSourceArr[tableId].length){
                //取消掉全选复选框的勾选
                tableTitleArea.getElementsByTagName('th')[0].getElementsByTagName('input')[0].checked = false;
                //获取数据源
                nowDataSource = dataSourceArr[tableId];
                //记录真实删除了的项的下标
                nowDataSource.forEach(function (item,index) {
                    trueDelIndexArr.push(index);
                });
                //清空数据源
                while (nowDataSource.length > 0){
                    nowDataSource.shift();
                }
                //清空片段数组
                finalTableArr[tableId] = [];
                /**
                 *  当片段数过多时，操作过频
                 *  while (finalTableArr[tableId].length > 0){
                        finalTableArr[tableId].shift();
                    }
                }*/
                //清空删除下标集合
                deleteItem[tableId] = [];
                //清空修改数据下标集合
                batchEditIndexArr[tableId] = [];
                //清空修改数据集合
                batchEditItemDataArr[tableId] = [];
                //若存在冻结承载框
                if(freezeColDiv.length != 0){
                    //获取展示区域的直接子节点
                    nodes = tableContentArea.children;
                    //删除所有table片段，除冻结承载框中的片段
                    for(let index = nodes.length - 1;index > -1;index --){
                        if(nodes[index].tagName.toLowerCase() == 'table'){
                            tableContentArea.removeChild(nodes[index]);
                        }
                    }
                    //将冻结承载框中的内容清空
                    freezeColDiv[0].innerHTML = '';
                }else {
                    //清空展示区域
                    tableContentArea.innerHTML = '';
                }
                //若是分页模式，要重建分页信息行
                if(isPaging){
                    _this.init_tablePage(1,tableId);
                }
                //清空选择下标数组
                selectTrIndexArr[tableId] = [];
            } else {
                _this.show_loadingPage(true,'正在删除数据，请稍后');
                //将选中的下标数组存入全局数组中
                if(deleteItem[tableId] === undefined){
                    deleteItem[tableId] = [];
                }
                //删除冻结承载框中的全部内容
                if(freezeColDiv.length != 0){
                    freezeColDiv[0].innerHTML = '';
                }
                //遍历table片段集合在删除数组中生成对应的区域
                finalTableArr[tableId].forEach(function (item,index) {
                    if(deleteItem[tableId][index] === undefined){
                        deleteItem[tableId][index] = [];
                    }
                    // (因为有可能多次删除，所以每次删除都会在对应的数组push进新的‘要删除下标’数组)
                    deleteItem[tableId][index].push(selectTrIndexArr[tableId]);
                });
                //先修改数据源
                selectTrIndexArr[tableId].forEach(function (item) {
                    //需要减去差值来获取正确下标
                    dataSourceArr[tableId].splice(item - differentValue,1);
                    //获取真实删除下标
                    trueDelIndexArr.push(item - differentValue);
                });
                //清空选择下标数组(不在这里清空的话，后面会干扰处理函数的结果)
                selectTrIndexArr[tableId] = [];
                //获取展示区域中的直接子节点
                nodes = tableContentArea.children;
                //将展示区域中的table片段提取出来（包括移除，不包括冻结框中的片段）
                while (nodes.length > 0){
                    nowTableArr.push(nodes[0]);
                    tableContentArea.removeChild(nodes[0]);
                }
                nodes = null;
                if(isPaging){
                    actPartIndex = 0;
                    //这里先将所有table片段进行删除操作是为了修改分页信息行的数据，所以之后分页信息行中的各种跳转按钮都无需再进行删除操作
                    while (actPartIndex < finalTableArr[tableId].length){
                        newActPart = _this.dealWith_tablePart(tableId,actPartIndex,'after');
                        if(newActPart == null){
                            break;
                        }else {
                            actPartIndex = parseInt(newActPart.getAttribute('levelindex')) + 1;
                        }
                    }
                    //若当前片段中的行数未被删0，则将修改后的片段插入展示区
                    if(nowTableArr[0].getElementsByTagName('tr').length != 0){
                        //获取要新插入的片段
                        newAppendPart = nowTableArr[0];
                        //插入展示区
                        tableContentArea.appendChild(newAppendPart);
                        //获取分页信息行的默认页码
                        newPageIndex = parseInt(newAppendPart.getAttribute('levelindex')) + 1;
                    }else {
                        if(parseInt(nowTableArr[0].getAttribute('levelindex')) > finalTableArr[tableId].length - 1){
                            //获取要新插入的片段
                            newAppendPart = finalTableArr[tableId][finalTableArr[tableId].length - 1];
                            //插入展示区
                            tableContentArea.appendChild(newAppendPart);
                            //获取分页信息行的默认页码
                            newPageIndex = parseInt(newAppendPart.getAttribute('levelindex')) + 1;
                        }else {
                            //获取要新插入的片段
                            newAppendPart = finalTableArr[tableId][parseInt(nowTableArr[0].getAttribute('levelindex'))];
                            //插入展示区
                            tableContentArea.appendChild(newAppendPart);
                            //获取分页信息行的默认页码
                            newPageIndex = parseInt(newAppendPart.getAttribute('levelindex')) + 1;
                        }
                        //修改新插入表格中子节点的宽度
                        // _this.reset_tableChildNodeWidth(newAppendPart);
                    }

                    //若冻结承载框存在
                    if(freezeColDiv.length != 0){
                        //获取新冻结片段
                        newFreezeColPart = _this.get_freezeContentColPart(tableId,newAppendPart);
                        //插入新的冻结片段
                        freezeColDiv[0].appendChild(newFreezeColPart);
                    }
                    //初始化分页信息行
                    _this.init_tablePage(finalTableArr[tableId].length,tableId,newPageIndex);
                }else {
                    //不分页的时候
                    actPartIndex = 0;
                    /**
                     * 上方已经做过处理：清空table展示区域中的直接table节点
                     * nowTableArr.forEach(function (dom) {
                        console.log(dom);
                        tableContentArea.removeChild(dom);
                       });
                     */
                    // tableContentArea.innerHTML = '';
                    //当不出现滚动条时,因为不是分页的时候不用固定显示某一片段，所以可以从0开始查找
                    while (tableContentArea.clientWidth == tableContentArea.offsetWidth){
                        //获取新处理的片段
                        newActPart = _this.dealWith_tablePart(tableId,actPartIndex,'after');
                        //或先后查找不到就向前查找
                        if(newActPart != null){
                            //将查找到的片段插入展示区
                            tableContentArea.appendChild(newActPart);
                            //修改新片段中的节点宽度
                            // _this.reset_tableChildNodeWidth(newActPart);
                            //根据上个查找到的片段的下标得到下个查找的起点
                            actPartIndex = parseInt(newActPart.getAttribute('levelindex')) + 1;
                            //释放内存
                            newActPart = null;
                            //若新的查找起点 > 片段最后一个子项的下标，则跳出
                            if(actPartIndex > finalTableArr[tableId].length - 1){
                                break;
                            }
                        }else {
                            //若查找不到片段，则跳出
                            break;
                        }
                    }
                    //若冻结承载框存在，将当前的table片段提取后插入承载框
                    if(freezeColDiv.length != 0){
                        //获取展示区的直接子节点
                        nodes = tableContentArea.children;
                        //将当前的table片段提取出冻结片段后插入冻结承载框
                        for(let index in nodes){
                            if(!isNaN(index) && nodes[index].tagName.toLowerCase() == 'table'){
                                //获取新冻结片段
                                newFreezeColPart = _this.get_freezeContentColPart(tableId,nodes[index]);
                                //插入新的冻结片段
                                freezeColDiv[0].appendChild(newFreezeColPart);
                            }
                        }
                    }
                    //获取当前展示区域可见宽度（不包括滚动条）
                    tableConfigWidth = tableContentArea.clientWidth;
                    //获取当前qd-table区域内所有table集合
                    allTableArr = tableContentArea.parentNode.getElementsByTagName('table');
                    //修改每个table的宽度
                    for(let tableKey in allTableArr){
                        if(!isNaN(tableKey)){
                            allTableArr[tableKey].style.width = tableConfigWidth + 'px';
                        }
                    }
                }
                //重新获取片段数
                pageNum[tableId] = (finalTableArr[tableId].length == 0) ? 1 : finalTableArr[tableId].length;
            }
            //重新复制表头区域的宽度
            tableTitleArea.style.width = tableContentArea.offsetWidth + 1 + 'px';
            //若回调函数不为null，则调用并返回删除下标数组
            if(deleteMethodCallBack != null){
                //若列排序的下标数组存在，则需要通过列排序下标数组进行提取真实的删除下标
                if(sortIndexArr[tableId].length > 0){
                    trueDelIndexArr.forEach(function (item) {
                        //提取真实的删除下标
                        returnDelIndexArr.push(sortIndexArr[tableId][item]);
                    });
                    //回传删除下标集合
                    deleteMethodCallBack(returnDelIndexArr);
                }else {
                    //回传删除下标集合
                    deleteMethodCallBack(trueDelIndexArr);
                }
            }
            //隐藏loading
            _this.show_loadingPage(false);
        }
        nowTableArr = null;
        linkInfo = null;
    };

    /*========================================  * 批量修改模块 *  ==========================================*/

    /**
     * 方法：插入批量修改框并绑定点击事件
     */
    _this.append_batchEdit = function () {
        //获取编辑框
        let batchEdit = document.getElementById('_qd_batchEdit');
        //若编辑框不存在则插入编辑框
        if(batchEdit == null){
            //在body末插入编辑框
            _this.append_nodeToBodyEnd(_this.domNode(batchEditDivHtml)[0]);
            //编辑框主题
            batchEdit = document.getElementById('_qd_batchEdit').firstElementChild;
            //绑定编辑框的点击事件
            _this.mouseDown_batchEditDiv(batchEdit);
        }
        batchEdit = null
    };

    /**
     * 方法：批量修改按钮的点击事件，用于生成表格插入批量修改框并显示
     */
    _this.create_batchEditContent = function (tableId) {
        //table区域
        let tableFaArea;
        //批量修改框对象
        let batchEditObj;
        //获取批量修改框的展示区域
        let batchEditTableArea;
        //存储下拉列表数据
        let selectDataArr = {};
        //当前表格的数据源
        let nowDataSource;
        //存储当前的子项数据
        let nowItemData;
        //获取表头区域
        let tableTitleArea;
        //获取表格内容区域
        let tableContentArea;
        //获取当前表头的html
        let nowTableTitleHtml;
        //获取当前表格内容（一行）
        let nowTableContentHtml;
        //暂时存储
        let shortTimeSave;
        //th的正则表达式
        let thHeadRule = /<th[^>]+_qd_headColumn[^>]+>((?!<\/th>).)*<\/th>/g;
        //td的正则表达式
        let tdHeadRule = /<td[^>]+_qd_headColumn[^>]+>((?!<\/td>).)*<\/td>/g;
        //记录table的width
        let tableWidth;
        //记录表格的分布
        let tableLayout;
        //table的html
        let tableHtml = '<table class="_qd_tableSize _qd_batchEditTable" border="1" name="qd-table"></table>';
        //新建table;
        let newTable = _this.domNode(tableHtml)[0];
        //获取行集合
        let trArr;
        //获取div子项节点集合
        let divArr;
        //获取配置数据
        let configData = configDataArr[tableId];

        //获取table区域
        tableFaArea = document.getElementById(tableId);
        //若没有勾选项则不执行下列代码
        if(selectTrIndexArr[tableId].length == 0){
            alert('请勾选上想要修改的行');
            return;
        }
        //获取编辑框主体
        batchEditObj = document.getElementById('_qd_batchEdit').firstElementChild;
        //将tableId写如主体属性中
        batchEditObj.setAttribute('idValue',tableId);
        //获取批量修改中的table展示区域
        batchEditTableArea = batchEditObj.getElementsByClassName('_qd_batchEditContentArea')[0];
        //清空展示区域；
        batchEditTableArea.innerHTML = '';
        //将批量修改的下标集合存储到全局数据中
        batchEditIndexArr[tableId] = selectTrIndexArr[tableId];
        //提取需要批量修改的行里的每项数据作为下拉项的数据源
        nowDataSource = dataSourceArr[tableId];
        //根据下标集合获取下拉项数据
        selectTrIndexArr[tableId].forEach(function (trIndex) {
            nowItemData = nowDataSource[trIndex - differentValue];
            Object.keys(nowItemData).forEach(function (attrName) {
                if(selectDataArr[attrName] === undefined){
                    selectDataArr[attrName] = [];
                }
                if(nowItemData[attrName] != '' && _this.inArray(nowItemData[attrName],selectDataArr[attrName]) < 0){
                    selectDataArr[attrName].push(nowItemData[attrName]);
                }
            });
            nowItemData = null;
        });
        //获取table的表头和内容中的一行进行表格生成
        //获取表头区域
        tableTitleArea = tableFaArea.getElementsByClassName('_qd_tableTitleDiv')[0];
        //获取内容区域
        tableContentArea = tableFaArea.getElementsByClassName('_qd_tableContentDiv')[0];
        //获取表头html
        shortTimeSave = tableTitleArea.getElementsByTagName('table');
        //若表头table的个数大于1时获取自定义表头，否则获取原始表头
        if(shortTimeSave.length > 1){
            for(let tableKey in shortTimeSave){
                //获取表头的html内容
                if(!isNaN(tableKey) && shortTimeSave[tableKey].className.indexOf('_qd_newTableTitle') > -1){
                    nowTableTitleHtml = shortTimeSave[tableKey].innerHTML;
                    break;
                }
            }
        }else {
            //获取表头html内容
            nowTableTitleHtml = shortTimeSave[0].innerHTML;
        }
        //获取当前展示页面的第一个table片段
        shortTimeSave = tableContentArea.getElementsByTagName('table')[0];
        //获取table判断中一行的html内容
        nowTableContentHtml = shortTimeSave.getElementsByTagName('tr')[0].outerHTML;
        //获取table片段的宽度
        tableWidth = shortTimeSave.style.width;
        //获取表格布局（是否平分）
        tableLayout = shortTimeSave.style.tableLayout;
        //消除titleHtml和contentHtml的复选框和序号
        if(nowTableTitleHtml.indexOf('</th>') > -1){
            nowTableTitleHtml = nowTableTitleHtml.replace(thHeadRule,'').replace(/<\/?tbody>/,'');
        }else {
            nowTableTitleHtml = nowTableTitleHtml.replace(tdHeadRule,'').replace(/<\/?tbody>/,'');
        }
        //消除复选框和序号
        nowTableContentHtml = nowTableContentHtml.replace(tdHeadRule,'').replace(/<\/?tbody>/,'');
        //删除所有原html中的所有下拉项
        nowTableContentHtml = _this.rewrite_batchEditTableContentHtml(nowTableContentHtml,selectDataArr);
        //修改新table的样式和属性
        newTable.style.width = tableWidth;
        //修改新table的表格布局
        newTable.style.tableLayout = tableLayout;
        //将内容插入新表格
        newTable.innerHTML = nowTableTitleHtml + nowTableContentHtml;
        //获取新表格中的行集合
        trArr = newTable.getElementsByTagName('tr');
        //根据配置信息修改行高
        for(let index in trArr){
            if(!isNaN(index)){
                //设置每行的高度
                trArr[index].style.height = (configData.setTableLineHeight !== undefined && configData.setTableLineHeight.lineHeight !== undefined) ? configData.setTableLineHeight.lineHeight : '30px';
                //判读行中存不存在_global_trSelectBgColor类名，有就删除
                if(trArr[index].className.indexOf('_global_trSelectBgColor') > -1){
                    trArr[index].classList.remove('_global_trSelectBgColor');
                }
            }
        }
        //获取所有排序三角形div的节点集合
        divArr = newTable.getElementsByClassName('_qd_tableTitleTriangleDiv');
        //将排序三角形删除
        for(let index = divArr.length -1;index > -1; index --){
            if(divArr[index].tagName.toLowerCase() == 'div'){
                divArr[index].parentNode.removeChild(divArr[index]);
            }
        }
        //将新表格插入展示区域
        batchEditTableArea.appendChild(newTable);
        //展示批量修改框
        _this.show_batchEdit(true);
        //修改批量修改框的height(必须在显示后才能获取height)
        batchEditObj.style.height = batchEditObj.offsetHeight + (newTable.offsetHeight - batchEditTableArea.clientHeight) + 'px';
        batchEditTableArea.parentNode.style.height = newTable.offsetHeight + (batchEditTableArea.offsetHeight - batchEditTableArea.clientHeight) + 'px';

        tableFaArea = null;
        batchEditObj = null;
        batchEditTableArea = null;
        selectDataArr = null;
        nowDataSource = null;
        tableTitleArea = null;
        tableContentArea = null;
        shortTimeSave = null;
        newTable = null;
    };

    /**
     * 方法：根据‘选中行’对应的数据对批量修改框中的表格内容进行替换填充
     */
    _this.rewrite_batchEditTableContentHtml = function (htmlStr) {
        let returnHTML;
        //td的正则表达式
        let tdRule = /<td((?!_global_displayNone)(?!<\/td>).)*>((?!<\/td>).)*<\/td>/g;
        //td头标签正则表达式
        let tdHeadLabelRule = /<td[^>]*>/;
        //编辑框正则表达式
        // let editDivRule = /<div[^>]*editBox[^>]*>((?!<\/button>).)*<\/button><\/div>/;
        //attrName的正则表达式
        let attrNameRule = /attrname=('|")[^'"]*('|")/;
        //p的正则表达式
        // let pRule = /<p[^>]*tdValue[^>]*>((?!<\/p>).)*<\/p>/;
        //存储返回的tdStr
        let returnTdStr;
        //存储当前的attrName;
        let nowAttrName;
        //暂时存储
        let shortTimeSave;
        //存储列表html
        // let listHtml;
        returnHTML = htmlStr.replace(tdRule,function (tdStr) {
            shortTimeSave = tdStr.match(attrNameRule)[0];
            nowAttrName = shortTimeSave.slice(10,-1);
            shortTimeSave = '';
            /*if(selectDataArr[nowAttrName].length > 0){
                selectDataArr[nowAttrName].forEach(function (item) {
                    shortTimeSave += batchEditLiHTML.replace('</li>',item + '</li>');
                });
                listHtml = batchEditSelectListHtml.replace('</ul>',shortTimeSave + '</ul>');
            }*/
            //清空td标签中的所有内容
            returnTdStr = tdStr.match(tdHeadLabelRule)[0] + '</td>';
            if(tdStr.indexOf('qdeditable="false"') > -1){
                /*returnTdStr = returnTdStr.replace(pRule,function (pStr) {
                    return pStr.slice(0,-4) + '不可编辑' + '</p>';
                })*/
                //若不可编辑，则需要写上不可编辑
                returnTdStr = returnTdStr.replace('</td>','不可编辑' + '</td>');
            }
            //加入列表
            /*returnTdStr = returnTdStr.replace(editDivRule,function (divStr) {
                if(shortTimeSave != ''){
                    return divStr.slice(0,-6) + listHtml + '</div>';
                }else {
                    return divStr;
                }
            });*/
            return returnTdStr;
        });
        return returnHTML;
    };

    /**
     * 方法：绑定批量修改中表格的各种点击事件
     */
    _this.mouseDown_batchEditTable = function () {
        //获取批量修改框中表格的展示区域
        let batchEditTableArea = document.getElementById('_qd_batchEdit').getElementsByClassName('_qd_batchEditContentArea')[0];
        //获取table的id
        let tableId;
        //存储点击对象
        let actObj;
        //获取当前点击的节点所在的td对象
        let nowTdObj;
        //获取当前行中的所有td
        let tdArr;
        //获取当前关联数据
        let linkData;
        //存储进行批量修改的行下标集合
        let trueEditIndexArr;
        //存储当前表格对应的数据源
        let data;
        //获取当前节点的属性名
        let nowAttrName;
        //获取td中的编辑框
        // let editBoxObj;
        //获取当前的输入框对象
        // let textAreaObj;
        //获取editBoxObj中的按钮
        // let btnObj;
        //获取editBoxObj中的下拉列表
        // let listObj;
        //获取下拉列表中的子项
        // let liArr;
        //绑定表格展示区域的点击事件
        batchEditTableArea.onmousedown = function (event) {
            //获取点击对象
            actObj = event.target;
            //获取点击对象所在的td对象
            nowTdObj = (actObj.tagName.toLowerCase() == 'p') ? actObj.parentNode : actObj;
            //当左键点击时,执行下面代码
            if(actObj && event.button == 0){
                tableId = document.getElementsByClassName('_qd_batchEditDiv')[0].getAttribute('idvalue');
                //获取td集合
                tdArr = nowTdObj.parentNode.getElementsByTagName('td');
                //初始化所有td对象（p标签展示，编辑框隐藏）*暂时不删除
                /*for(let tdKey in tdArr){
                    if(!isNaN(tdKey) && tdArr[tdKey].getElementsByTagName('p')[0].className.indexOf('_global_displayNone') > -1){
                        tdArr[tdKey].getElementsByTagName('p')[0].classList.remove('_global_displayNone');
                        tdArr[tdKey].getElementsByTagName('div')[0].classList.add('_global_displayNone');
                    }
                }*/
                //判定td框可编辑
                if(nowTdObj.getAttribute('name') == 'dataValue' && !nowTdObj.getAttribute('qdeditable')){
                    /*//隐藏p便签
                    nowTdObj.getElementsByTagName('p')[0].classList.add('_global_displayNone');
                    //获取编辑框
                    editBoxObj = nowTdObj.getElementsByTagName('div')[0];
                    //设置编辑框的高度
                    editBoxObj.style.height = (nowTdObj.offsetHeight - 2) + 'px';
                    //显示编辑框
                    editBoxObj.classList.remove('_global_displayNone');
                    //若编辑框的列表存在，展示下拉列表的按钮，否则隐藏。
                    if(editBoxObj.getElementsByTagName('ul').length != 0){
                        editBoxObj.getElementsByTagName('button')[0].classList.remove('_global_displayNone');
                        //获取下拉列表
                        listObj = editBoxObj.getElementsByTagName('ul')[0];
                        //修改列表的几何样式
                        listObj.style.top = nowTdObj.offsetHeight + 'px';
                        listObj.style.maxHeight = 2 * (nowTdObj.offsetHeight - 2) + 'px';
                    }else {
                        editBoxObj.getElementsByTagName('button')[0].classList.add('_global_displayNone');
                    }
                    //获取编辑框中的输入标签
                    textAreaObj = editBoxObj.getElementsByTagName('textarea')[0];
                    //获取下拉按钮
                    btnObj = editBoxObj.getElementsByTagName('button')[0];
                    //若输入对象不为undefined且没绑定input事件
                    if(textAreaObj !== undefined && textAreaObj.oninput == null){
                        textAreaObj.oninput = function () {
                            editBoxObj.previousElementSibling.innerText = textAreaObj.value;
                            textAreaObj.style.height = textAreaObj.scrollHeight + 'px';
                            if(listObj !== undefined){
                                liArr = listObj.getElementsByTagName('li');
                                for(let liKey in liArr){
                                    if(!isNaN(liKey)){
                                        if(liArr[liKey].textContent.indexOf(textAreaObj.value) > -1){
                                            liArr[liKey].classList.remove('_global_displayNone');
                                        }else {
                                            liArr[liKey].classList.add('_global_displayNone');
                                        }
                                    }
                                }
                                liArr = null;
                            }
                        }
                    }
                    //同上
                    if(textAreaObj !== undefined && textAreaObj.onblur == null){
                        textAreaObj.onblur = function () {
                            editBoxObj.previousElementSibling.innerText = textAreaObj.value;
                        }
                    }
                    //同上
                    if(btnObj !== undefined && btnObj.onmousedown == null){
                        btnObj.onmousedown = function () {
                            liArr = listObj.getElementsByTagName('li');
                            if (listObj.className.indexOf('_global_displayNone') > -1) {
                                listObj.classList.remove('_global_displayNone');
                                for(let liKey in liArr){
                                    if(!isNaN(liKey) && liArr[liKey].className.indexOf('_global_displayNone') > -1){
                                        liArr[liKey].classList.remove('_global_displayNone');
                                    }
                                }
                            } else {
                                listObj.classList.add('_global_displayNone');
                            }
                        };
                    }
                    //同上
                    if(listObj !== undefined && listObj.onmousedown == null){
                        listObj.onmousedown = function (event) {
                            if(event.target && event.button == 0 && event.target.tagName.toLowerCase() == 'li'){
                                textAreaObj.value = event.target.textContent;
                                editBoxObj.previousElementSibling.innerText = textAreaObj.value;
                                listObj.classList.add('_global_displayNone');
                            }
                        }
                    }*///*暂时不删除
                    //获取当前点击的节点
                    nowEditTdNode = nowTdObj;
                    //获取对应表格批量修改下标集合
                    trueEditIndexArr = batchEditIndexArr[tableId];
                    //获取当前表格对应的数据源
                    data = dataSourceArr[tableId];
                    //获取当前点击节点的属性名
                    nowAttrName = nowEditTdNode.getAttribute('attrname');
                    //初始化linkData;
                    linkData = {};
                    //写入属性名
                    linkData.attrName = nowAttrName;
                    //写入是否多选
                    linkData.isMoreSelect = false;
                    //初始化数据源
                    linkData.dataSource = [];
                    //根据修改下标集合进行关联数据提取
                    trueEditIndexArr.forEach(function (item) {
                        linkData.dataSource.push(data[item - differentValue][nowAttrName]);
                    });
                    //初始化编辑框
                    _this.initEditBox(nowTdObj,linkData);
                }
            }
        }
    };

    /**
     * 方法：用于绑定批量修改框上的事件
     */
    _this.mouseDown_batchEditDiv = function (batchEdit) {
        //获取右上角关闭按钮
        let batchEditClose = batchEdit.getElementsByClassName('_qd_batchEditTitleCloseDiv')[0];
        //获取底部按钮区域
        let batchEditBtnDiv = batchEdit.getElementsByClassName('_qd_batchEditFooter')[0];
        //获取点击对象
        let actObj;
        //获取按钮上的判定值
        let btnValue;
        //绑定关闭按钮事件
        if(batchEditClose.onmousedown == null){
            batchEditClose.onmousedown = function (event) {
                actObj = event.target;
                if(actObj && event.button == 0){
                    _this.show_batchEdit(false);
                }
            }
        }
        //绑定按钮区事件
        if(batchEditBtnDiv.onmousedown == null){
            batchEditBtnDiv.onmousedown = function (event) {
                actObj = event.target;
                if(actObj && event.button == 0 && actObj.tagName.toLowerCase() == 'button'){
                    btnValue = actObj.getAttribute('value');
                    switch (btnValue){
                        case 'editTrue':
                            _this.btnTrue_batchEdit(batchEdit);
                            break;
                        case 'editFalse':
                            console.log('我隐藏了');
                            _this.show_batchEdit(false);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    };

    /**
     * 方法：批量修改确定按钮事件
     */
    _this.btnTrue_batchEdit = function (batchEdit) {
        //获取编辑框中的table片段
        let tableObj = batchEdit.getElementsByTagName('table')[0];
        //获取新的数据对象
        let newDataItem = {};
        //获取tr节点集合
        let trArr = tableObj.getElementsByTagName('tr');
        //获取td节点集合
        let tdArr;
        //获取属性名
        let attrName;
        //获取属性值
        let attrValue;
        //获取tableId
        let tableId = batchEdit.getAttribute('idvalue');
        //获取当前绑定的数据源
        let trueDataSource;
        //获取要修改的行的序号
        let trueEditIndexArr;
        //获取当前序号
        let nowIndex;

        //获取td节点集合
        tdArr = trArr[trArr.length - 1].getElementsByTagName('td');
        //提取数值
        for(let tdKey in tdArr){
            //若td未被隐藏且td是可编辑的状态则执行以下内容
            if(!isNaN(tdKey) && tdArr[tdKey].className.indexOf('_global_displayNone') < 0 && !tdArr[tdKey].getAttribute('qdeditable')){
                //获取属性名
                attrName = tdArr[tdKey].getAttribute('attrname');
                //获取要写入的值
                // attrValue = tdArr[tdKey].getElementsByTagName('p')[0].textContent;
                attrValue = tdArr[tdKey].textContent;
                //当要写入的值不为空时写入数据对象，否则不做处理
                if(attrValue != ''){
                    newDataItem[attrName] = attrValue;
                }
            }
        }
        //获取对应表格的数据源
        trueDataSource = dataSourceArr[tableId];
        //获取对应表格批量修改下标集合
        trueEditIndexArr = batchEditIndexArr[tableId];
        //根据要修改的行下标来修改数据源中的值
        trueEditIndexArr.forEach(function (item) {
            //获取在数据源中的真实位置
            nowIndex = item - 1;
            //通过属性名修改对应的值
            Object.keys(newDataItem).forEach(function (key) {
                trueDataSource[nowIndex][key] = newDataItem[key];
            });
        });
        //用于记录修改的数据并修改当前片段中对应tr的数据
        _this.save_batchEditData(tableId,newDataItem,trueEditIndexArr);
        //隐藏修改框
        _this.show_batchEdit(false);
    };

    /**
     * 方法：用于记录修改的数据并修改当前片段中对应tr的数据
     * 修改：将记录数据和修改表格的两个功能分开（已完成）
     */
    _this.save_batchEditData = function (tableId, newDataItem, trueEditIndexArr) {
        //获取tableId对应的区域对象
        let tableFaArea = document.getElementById(tableId);
        //获取当前的展示区域对象
        let tableContentArea = tableFaArea.getElementsByClassName('_qd_tableContentDiv')[0];
        //获取当前的片段集合
        let tablePartArr = tableContentArea.getElementsByTagName('table');
        //存储修改的基准数据
        let editData;

        //将数据存进数组
        if(batchEditItemDataArr[tableId] === undefined){
            batchEditItemDataArr[tableId] = [];
        }
        //根据table片段数进行修改数据存储
        for(let index = 0; index < finalTableArr[tableId].length; index ++){
            //新建数据对象
            editData = {};
            //存储修改的数据
            editData.data = newDataItem;
            //存储要修改的下标
            editData.indexArr = trueEditIndexArr;
            if(batchEditItemDataArr[tableId][index] === undefined){
                batchEditItemDataArr[tableId][index] = [];
            }
            //将新的数据对象保存
            batchEditItemDataArr[tableId][index].push(editData);
            //释放变量
            editData = null;
        }
        //根据批量修改信息对当前片段就行修改
        for(let partKey in tablePartArr){
            if(!isNaN(partKey)){
                //修改当前片段中的表格数据
                _this.edit_aloneTablePart(tableId,tablePartArr[partKey]);
            }
        }
        //释放变量
        tableFaArea = null;
        tableContentArea = null;
        tablePartArr = null;
        editData = null;
        newDataItem = null;
        trueEditIndexArr = null;
    };

    /**
     * 方法：用于展示隐藏批量修改框
     */
    _this.show_batchEdit = function (isShow) {
        let batchEdit = document.getElementById('_qd_batchEdit');
        if(isShow){
            //展示
            if(batchEdit.className.indexOf('_global_displayNone') > -1){
                batchEdit.classList.remove('_global_displayNone');
            }
        }else {
            //隐藏
            if(batchEdit.className.indexOf('_global_displayNone') < 0){
                batchEdit.classList.add('_global_displayNone');
            }
        }
        batchEdit = null;
    };

    /**
     * 方法：根据批量修改的数据修改单个table片段
     */
    _this.edit_aloneTablePart = function (tableId,tablePartObj) {
        //获取片段下标
        let tablePartIndex = parseInt(tablePartObj.getAttribute('levelindex'));
        //获取片段对应的批量修改数据
        let editDataArr = batchEditItemDataArr[tableId][tablePartIndex];
        //存储批量修改数据的子项数据
        let editDataItem;
        //存储修改下标跟当前片段的关系
        let linkInfo;
        //存储当前片段中需要修改的行的下标集合
        let editIndexArr;
        //存储修改的基准数据
        let editData;
        //获取当前片段的tr集合
        let trArr = tablePartObj.getElementsByTagName('tr');
        //存储td集合
        let tdArr;
        //存储当前的tr下标
        let nowTrIndex;
        //存储当前的td的attrName;
        let nowTdAttrName;

        //修改当前片段的信息
        while(editDataArr.length > 0){
            //删除并获取第一个子项信息集合
            editDataItem = editDataArr.shift();
            //获取批量修改的下标集合与当前片段的关联信息
            linkInfo = _this.selectArrOnTable(tableId,tablePartIndex,editDataItem.indexArr);
            //获取当前片段真正需要修改的下标集合
            editIndexArr = linkInfo.delArr;
            //获取修改的基准数据
            editData = editDataItem.data;
            for(let trKey in trArr){
                if(!isNaN(trKey)){
                    //获取当前行的td集合
                    tdArr = trArr[trKey].getElementsByTagName('td');
                    //获取行下标
                    for(let tdKey in tdArr){
                        if(!isNaN(tdKey) && tdArr[tdKey].getAttribute('name') == 'dataItemId'){
                            nowTrIndex = parseInt(tdArr[tdKey].textContent);
                            break;
                        }
                    }
                    //若行下标存在于修改下标集合，则执行
                    if(_this.inArray(nowTrIndex,editIndexArr) > -1){
                        for(let tdKey in tdArr){
                            if(!isNaN(tdKey) && tdArr[tdKey].className.indexOf('_global_displayNone') < 0 && tdArr[tdKey].getAttribute('name') == 'dataValue' && !tdArr[tdKey].getAttribute('reset')){
                                //获取当前td的attrName
                                nowTdAttrName = tdArr[tdKey].getAttribute('attrname');
                                //若基准数据的nowTdAttrName属性存在则修改
                                if(editData[nowTdAttrName] !== undefined ){//&& tdArr[tdKey].getElementsByTagName('p').length != 0
                                    // tdArr[tdKey].getElementsByTagName('p')[0].innerText = editData[nowTdAttrName];
                                    tdArr[tdKey].innerText = editData[nowTdAttrName];
                                }
                            }
                        }
                    }
                }
            }
        }
        tablePartObj = null;
        editDataArr = null;
        editDataItem = null;
        linkInfo = null;
        editIndexArr = null;
        editData = null;
        trArr = null;
        tdArr = null;
    };

    /*========================================  * ??? *  ==========================================*/

    /**
     * 方法：设置table区域内容区域的最大高度
     */
    _this.set_contentAreaHeight = function (tableArea) {
        //获取功能按钮区域
        let buttonArea = tableArea.getElementsByClassName('_qd_funBtnDivSize')[0];
        //获取表格表头区域
        let titleArea = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0];
        //获取表格内容区域
        let contentArea = tableArea.getElementsByClassName('_qd_tableContentDiv')[0];
        //存储内容区域的高度
        let contentHeight;
        //设置展示区域的最大高度
        if(tableArea.parentNode.tagName.toLowerCase() == 'body'){
            contentHeight = document.body.clientHeight - titleArea.offsetHeight - buttonArea.offsetHeight;
            contentArea.style.maxHeight = contentHeight + 'px';
        }else {
            contentHeight = tableArea.clientHeight - titleArea.offsetHeight - buttonArea.offsetHeight;
            contentArea.style.maxHeight = contentHeight + 'px';
        }
    };

    /**
     * 方法：用于修改‘区域内所有table’/‘特定table’的宽度
     */
    _this.reset_tableWidth = function(domObj,trueWidth) {
        let tableArr;
        if(domObj.tagName.toLowerCase() == 'table'){
            domObj.style.width = trueWidth + 'px';
        }else {
            tableArr = domObj.getElementsByTagName('table');
            for(let index in tableArr){
                if(!isNaN(index)){
                    tableArr[index].style.width = trueWidth + 'px';
                }
            }
        }
        domObj = null;
        tableArr = null;
    };

    /**
     * 方法：执行配置信息中特定的方法
     */
    _this.set_configToTable = function (tableObj,configDataObj) {
        let AttrNameArr = Object.keys(configDataObj);
        let _data;
        if(AttrNameArr.length > 0){
            AttrNameArr.forEach(function (attr) {
                _data = configDataObj[attr];
                switch (attr){
                    case 'setTableWidth':
                        _this.set_tableWidthHTML(tableObj,_data.tableWidth,_data.isEqual);
                        break;
                    default:
                        break;
                }
            })
        }
        tableObj = null;
        configDataObj = null;
    };

    /**
     * 方法：生成表格最外层父框并替换插件的‘识别标签’
     */
    _this.create_fatherDiv = function (tableId) {
        let bodyObj = document.getElementsByTagName('body')[0];
        let fatherDivHTML = document.createElement('div');
        let tableObj = document.getElementById(tableId);
        let parentNode = tableObj.parentNode;
        let divsHtml = '<div class="_qd_tableTitleDiv"></div><div class="_qd_tableContentDiv"></div>';
        let XNDom = document.createDocumentFragment();
        let divObjArr = _this.domNode(divsHtml);
        let loadingObj = _this.domNode(loadingDivHTML)[0];

        divObjArr.forEach(function (divObj) {
            divObj.setAttribute('name',tableId + '_tableDiv');
            XNDom.appendChild(divObj);
        });
        fatherDivHTML.classList.add('_qd_tableDivSize');
        fatherDivHTML.setAttribute('id',tableId);
        fatherDivHTML.setAttribute('name','tableFather');
        fatherDivHTML.appendChild(XNDom);
        parentNode.insertBefore(fatherDivHTML,tableObj);
        parentNode.removeChild(tableObj);
        if(bodyObj.lastElementChild.tagName.toLowerCase() == 'script'){
            bodyObj.insertBefore(loadingObj,bodyObj.lastElementChild);
        }
        //释放内存
        fatherDivHTML = null;
        tableObj = null;
        parentNode = null;
        XNDom = null;
        divObjArr = null;
        bodyObj = null;
        loadingObj = null;
    };

    //方法：用于冻结行
    /*_this.freeze_line = function (tableObj,htmlStrArr,freezeConfig) {
        let freezeTable = document.createElement('table');
        let unFreezeDiv = document.createElement('div');
        let configInfo = parseInt(freezeConfig.configInfo);
        let splitPoint;
        let remainder;
        let shortTimeSave = '';
        let tableFatherDiv = tableObj.parentNode;
        let trRule = /<tr((?!<\/tr>).)+<\/tr>/g;
        let freezeTrHTML = '';
        let freezeHTMLArr;

        freezeTable.setAttribute('id',tableObj.getAttribute('id') + '_freeze');
        freezeTable.classList.add('_qd_freezeTable');
        unFreezeDiv.classList.add('_qd_unFreezeDiv');
        tableFatherDiv.insertBefore(freezeTable,tableObj);
        tableFatherDiv.insertBefore(unFreezeDiv,tableObj);
        unFreezeDiv.appendChild(tableObj);
        splitPoint = (configInfo + 1)/100;
        remainder = (configInfo + 1)%100;
        if(splitPoint > 0){
            for(let num = 0;num < splitPoint; num ++){
                freezeTrHTML += htmlStrArr.shift();
            }
        }
        if(remainder > 0){
            htmlStrArr[0].match(trRule).forEach(function (itemStr,index) {
                if(index < remainder)
                    shortTimeSave += itemStr;
            });
            htmlStrArr[0].replace(shortTimeSave,'');
            freezeTrHTML += shortTimeSave;
        }
        freezeHTMLArr = _this.stringCutUp(freezeTrHTML);
        _this.renderPage(freezeTable,freezeHTMLArr);
        freezeTable = null;
        unFreezeDiv = null;
        tableFatherDiv = null;
        freezeHTMLArr = null;
        for(let index in arguments){
            if(!isNaN(index)){
                arguments[index] = null;
            }
        }
    };*/

    //方法：用修改字符串的形式添加关联数组
    /*_this.write_linkDataToHtml = function (tableId,innerHtml,attrName,linkDataSource,isMoreSelect) {
        let htmlStr = innerHtml;
        //匹配td[name="dataValue"]的字符串
        let tdRule = /<td[^>]+attrname=[^>]+>((?!<\/td>).)+<\/td>/g;
        //匹配attrname字符串
        let attrNameRule = /attrname=('|")[^'"]+('|")/;
        //匹配button字符串
        let btnRule = /<button[^>]+>/;
        //匹配class字符串
        let classRule = /class=('|")[^'"]+('|")/;
        //匹配list区域字符串
        let listRule = /<\/button>((?!<\/div><\/td>).)*<\/div><\/td>/;
        let listObj;
        let listHTML;
        let liHTML;
        let liStr = '';
        let nodeAttrName;
        //回传的btnStr
        let returnBtnStr;
        //回传的tdStr;
        let returnTdStr;
        //回传的Html;
        let returnHTML;

        liHTML = (isMoreSelect) ? moreSelectLiHTML : aloneSelectLiHTML;
        linkDataSource.forEach(function (item) {
            if(isMoreSelect){
                liStr += liHTML.replace('</p>',item + '</p>');
            }else {
                liStr += liHTML.replace('</li>',item + '</li>');
            }
        });
        listObj = (isMoreSelect) ? _this.domNode(moreSelectListHTML)[0] : _this.domNode(aloneSelectListHtml)[0];
        if(isMoreSelect){
            listObj.getElementsByTagName('ul')[0].innerHTML = liStr;
        }else {
            listObj.innerHTML = liStr;
        }
        listHTML = listObj.outerHTML;
        // console.log(listHTML);
        returnHTML = htmlStr.replace(tdRule, function (tdStr) {
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
        return returnHTML;
    };*/

    /**
     * 方法：用于设置table的宽度和是否均分列宽
     */
    _this.set_tableWidthHTML = function (areaObj,widthValue,isEqual) {
        isEqual = isEqual || false;
        // let tableParentDivObj = _this.parents(tableObj,'div[name="tableFather"]')[0];
        let trueWidth = (widthValue != null) ? parseInt(widthValue) + 'px' : '100%';
        let tableArr;
        //若区域对象是table的话直接修改，若不是，则先获取区域对象里的table后进行修改
        if(areaObj.tagName.toLowerCase() == 'table'){
            areaObj.style.tableLayout = (isEqual) ? 'fixed' : 'automatic';
        }else {
            //修改tableFather区域的width
            areaObj.style.width = trueWidth;
        }
        /*else {
            tableArr = areaObj.getElementsByTagName('table');
            for(let tableKey in tableArr){
                if(!isNaN(tableKey)){
                    tableArr[tableKey].style.width = trueWidth;
                    tableArr[tableKey].style.tableLayout = (isEqual) ? 'fixed' : 'automatic';
                }
            }
        }*/
        areaObj = null;
        tableArr = null;
    };

    //方法：用于设置行高
    /*_this.set_tableLineHeightHTML = function (tableId,innerHtml,heightValue) {
        let htmlStr = innerHtml;
        let trRule = /<tr[^>]*>/g;
        let styleRule = /style=('|")[^'"]+('|")/;
        let heightRule = /height:[^;]+;?/;
        let tdRule = /<td[^>]+dataValue[^>]+>((?!<\/td>).)+<\/td>/g;
        let editBoxRule = /<div[^>]+editBox[^>]+>/;
        //存储heightValue的数值
        let trueLineHeight;
        let returnTrStr;
        let returnStyleStr;
        let returnTdStr;
        let returnBoxStr;
        let returnHtml;

        //number化heightValue;
        trueLineHeight = parseInt(heightValue);

        returnHtml = htmlStr.replace(trRule,function (trStr) {
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
        // return htmlStrArr;
        for(let index in arguments){
            if(!isNaN(index)){
                arguments[index] = null;
            }
        }

        return returnHtml;
    };*/

    /**
     * 方法：全局点击事件
     */
    _this.mouseDown_global = function () {
        //获取当前点击对象所在的头部td对象（含有复选框的td）
        let nowSelectTdObj;
        //获取当前的内容展示区域
        let nowContentDivObj;
        //获取当前点击对象所在的内容td对象
        let nowContentTdObj;
        //获取当前的冻结承载框
        let nowFreezeColDivObj;
        //当前页面所有qd-table
        let qdTableArr;
        //获取当前点击的qd-table
        let nowTableObj;
        //获取当前点击所在的头部th对象（含有复选框的th）
        let nowSelectThObj;
        //获取当前点击所在的自定义表头td对象
        let diyTitleSelectTdObj;
        //获取当前点击对象所在的编辑框对象
        // let editBoxObj;
        //获取批量修改展示框对象
        let batchEditObj;
        //获取body对象
        let bodyObj = document.body;
        //获取当前点击对象
        let nowActObj;
        //获取当前行
        let nowTrObj;
        //获取tableId
        let tableId;
        //获取配置信息数据
        // let configData;
        //获取当前行中的复选框节点
        let nowCheckBoxNode;
        //暂时存储
        let shortTimeSave;
        //绑定body的mousedown事件，采用事件监听是为了防止事件被覆盖
        bodyObj.addEventListener('mousedown',function (event) {
            if(isReSetData){
                //若正在重写数据则取消事件执行
                return;
            }
            qdTableArr = document.getElementsByName('tableFather');
            nowActObj = event.target;
            nowTableObj = _this.parents(nowActObj,'table[name="qd-table"]');
            if(qdTableArr.length == 0){
                return;
            }
            //若点击对象存在且（左键或右键）
            if(nowActObj && (event.button == 0 || event.button == 2)){
                //证明点击对象是否在全选框区域内
                nowSelectThObj = _this.parents(nowActObj,'th[name="dataAllSelect"]');
                //证明点击对象是否在单选框区域内
                nowSelectTdObj = _this.parents(nowActObj,'td[name="dataItemSelect"]');
                //证明自己在展示区域内
                nowContentDivObj = _this.parents(nowActObj,'div._qd_tableContentDiv');
                //证明点击对象是否在td内
                nowContentTdObj = _this.parents(nowActObj,'td[name="dataValue"]');
                //证明点击对象是否在编辑区内
                // editBoxObj = _this.parents(nowActObj,'div[name="editBox"]');
                //证明点击对象是否在自定义表头内
                diyTitleSelectTdObj = _this.parents(nowActObj,'td[name="dataAllSelect"]');
                //证明点击对象是否在批量修改框内
                batchEditObj = _this.parents(nowActObj,'div._qd_batchEditContentArea');
                //证明点击对象不在冻结承载框内
                nowFreezeColDivObj = _this.parents(nowActObj,'div._qd_freColDiv');

                //用于初始化选中样式：当点击节点是td，属性'name'为'dataValue'，不在冻结框内
                if(nowActObj.tagName.toLowerCase() == 'td' && nowActObj.getAttribute('name') == 'dataValue' && nowFreezeColDivObj.length == 0 && batchEditObj.length == 0){
                    if(!event.ctrlKey && !event.shiftKey){
                        tableId = _this.parents(nowActObj,'div[name="tableFather"]')[0].id;
                        for(let tableKey in qdTableArr){
                            if(!isNaN(tableKey)){
                                //初始化选中行样式
                                _this.init_tableStyle(qdTableArr[tableKey]);
                            }
                        }
                        //存储最后选中的行下标
                        finalSelTrIndexArr[tableId] = 0;
                        //parseInt(_this.parents(nowActObj,'tr[name="tableContent"]')[0].getElementsByTagName('td')[1].textContent);
                    }
                }
                //用于选中单前行：不在批量修改框，不在冻结框内，点击节点为td，属性'name'为'dataValue'
                if(batchEditObj.length == 0 && nowFreezeColDivObj.length == 0 && nowActObj.tagName.toLowerCase() == 'td' && nowActObj.getAttribute('name') == 'dataValue'){
                    //获取当前选中下标
                    let nowSelTrIndex = parseInt(_this.parents(nowActObj,'tr[name="tableContent"]')[0].getElementsByTagName('td')[1].textContent);
                    //获取tableId
                    tableId = _this.parents(nowActObj,'div[name="tableFather"]')[0].id;
                    //当只按了shift键
                    if(event.shiftKey && !event.ctrlKey && nowSelTrIndex != finalSelTrIndexArr[tableId]){
                        let min,max,nowTablePageIndex;
                        //清空选中行下标集合
                        selectTrIndexArr[tableId].splice(0,selectTrIndexArr[tableId].length);
                        //获取当前table片段的下标
                        nowTablePageIndex = parseInt(_this.parents(nowActObj,'table[name="qd-table"]')[0].getAttribute('levelindex'));
                        //获取最小值
                        min = (nowSelTrIndex < finalSelTrIndexArr[tableId]) ? nowSelTrIndex : finalSelTrIndexArr[tableId];
                        //获取最大值
                        max = (nowSelTrIndex < finalSelTrIndexArr[tableId]) ? finalSelTrIndexArr[tableId] : nowSelTrIndex;
                        //循环写入
                        for(let index = min; index < max + 1; index ++){
                            //写入下标
                            selectTrIndexArr[tableId].push(index);
                        }
                        //若分页
                        if(isPaging){
                            //若片段是第一片段
                            if(nowTablePageIndex == 0){
                                _this.dealWith_tablePart(tableId, nowTablePageIndex, 'after');
                            }else if(nowTablePageIndex == finalTableArr[tableId].length - 1){//若片段是最后片段
                                _this.dealWith_tablePart(tableId, nowTablePageIndex, 'before');
                            }else {//若片段是中间片段
                                _this.dealWith_tablePart(tableId, nowTablePageIndex, 'after');
                            }
                        }else {//非分页
                            //获取当前页面中的所有片段
                            let nowPageArr = _this.parents(nowActObj,'div._qd_tableContentDiv')[0].getElementsByClassName('_qd_tableSize');
                            //遍历所有片段并传入处理函数
                            for(let index in nowPageArr){
                                if(!isNaN(index)){
                                    _this.dealWith_tablePart(tableId, nowPageArr[index].getAttribute('levelindex'), 'after');
                                }
                            }
                        }
                    }else {//不按shift
                        //获取当前tr对象
                        nowTrObj = _this.parents(nowActObj,'tr[name="tableContent"]')[0];
                        //tr标签更换背景颜色
                        // nowTrObj.classList.add('_global_trSelectBgColor');
                        //获取当前行的复选框节点
                        nowCheckBoxNode = nowTrObj.getElementsByTagName('td')[0].getElementsByTagName('input')[0];
                        //生成假event
                        shortTimeSave = {};
                        //赋值target
                        shortTimeSave.target = nowCheckBoxNode;
                        //调用复选框方法
                        _this.bindChangeEvent_checkbox(shortTimeSave,tableId);
                        //改变当前复选框的选中状态
                        nowCheckBoxNode.checked = !nowCheckBoxNode.checked;
                        //触发onchange事件
                        nowCheckBoxNode.onchange();
                        //修改最后选中行的下标
                        finalSelTrIndexArr[tableId] = parseInt(_this.parents(nowActObj,'tr[name="tableContent"]')[0].getElementsByTagName('td')[1].textContent);
                    }
                }
                //当只按了ctrl键
                // if(event.ctrlKey && !event.shiftKey){
                //
                // }

                //改正：用双击调出编辑框。 用于弹出表格的编辑框：左键，不在冻结框内，点击节点为td，属性为可编辑，属性'name'为'dataValue'，不在批量修改框内
                /*if(event.button == 0 && nowFreezeColDivObj.length == 0 && nowActObj.tagName.toLowerCase() == 'td' && !nowActObj.getAttribute('qdeditable')
                    && nowActObj.getAttribute('name') == 'dataValue' && batchEditObj.length == 0 && !nowActObj.getAttribute('reset')){
                    //获取当前选中的td;
                    nowEditTdNode = nowActObj;
                    //获取tableId
                    tableId = _this.parents(nowActObj,'div[name="tableFather"]')[0].getAttribute('id');
                    //获取配置属性数据
                    configData = configDataArr[tableId];
                    //初始化编辑框
                    _this.initEditBox(nowEditTdNode,configData.writeLinkData);
                    // _this.mouseDown_p(event);
                }*/
                //用于触发复选框点击事件：在规定的table内，点击节点为input，类型为复选框，在默认表头中或在表格内容中或在自定义表头中
                if(nowTableObj.length != 0 && nowActObj.tagName.toLowerCase() == 'input' && nowActObj.getAttribute('type') == 'checkbox'
                    && (nowSelectThObj.length != 0 || nowSelectTdObj.length != 0 || diyTitleSelectTdObj.length != 0)){
                    tableId = _this.parents(nowActObj,'div[name="tableFather"]')[0].id;
                    //绑定复选框点击事件
                    _this.bindChangeEvent_checkbox(event,tableId);
                }

            }
        })
    };

    /**
     * 方法：全局的双击事件
     */
    _this.dblclick_global = function () {
        //获取body对象
        let bodyObj = document.body;
        //获取当前点击对象
        let nowActObj;
        //获取当前的内容展示区域
        let nowContentDivObj;
        //获取批量修改展示框对象
        let batchEditObj;
        //获取当前的冻结承载框
        let nowFreezeColDivObj;
        //获取tableId
        let tableId;
        //获取配置信息数据
        let configData;
        //获取当前表格对应的属性名称
        let nowTdName;
        //创建新Input节点
        let newInputNode;
        //获取弹出编辑框的属性名数组
        let openEditBoxAttrNameArr;
        //绑定双击监听事件
        bodyObj.addEventListener('dblclick',function (event) {
            //获取当前点击对象
            nowActObj = event.target;
            //若点击对象存在，且左键点击
            if(nowActObj && event.button == 0){
                //证明自己在展示区域内
                nowContentDivObj = _this.parents(nowActObj,'div._qd_tableContentDiv');
                //证明点击对象是否在批量修改框内
                batchEditObj = _this.parents(nowActObj,'div._qd_batchEditContentArea');
                //证明点击对象不在冻结承载框内
                nowFreezeColDivObj = _this.parents(nowActObj,'div._qd_freColDiv');
                //若在展示区内不在批量修改框内且不在冻结框内
                if(nowActObj.tagName.toLowerCase() == 'td' && !nowActObj.getAttribute('qdeditable') && nowActObj.getAttribute('name') == 'dataValue'
                    && !nowActObj.getAttribute('reset') && nowContentDivObj.length > 0 && batchEditObj.length == 0 && nowFreezeColDivObj.length == 0){
                    //获取当前选中的td;
                    nowEditTdNode = nowActObj;
                    //获取tableId
                    tableId = _this.parents(nowActObj,'div[name="tableFather"]')[0].getAttribute('id');
                    //获取要开启弹出框属性名称数组
                    openEditBoxAttrNameArr = getOpenEditBoxAttrName(configDataArr[tableId]);
                    //获取当前td节点对应的属性名称
                    nowTdName = nowActObj.getAttribute('attrname');
                    //若当前td对应的属性名在数组内
                    if(_this.inArray(nowTdName,openEditBoxAttrNameArr) > -1){
                        //获取配置属性数据
                        configData = configDataArr[tableId];
                        //初始化编辑框
                        _this.initEditBox(nowEditTdNode,configData.writeLinkData);
                    }else {
                        //获取新input节点
                        newInputNode = document.createElement('INPUT');
                        //将td的内容写入input中
                        newInputNode.value = nowEditTdNode.textContent;
                        //清空td节点的内容
                        nowEditTdNode.innerText = '';
                        //将input节点写入td节点中
                        nowEditTdNode.appendChild(newInputNode);
                        //给input添加样式类名
                        newInputNode.classList.add('_qd_tdInput');
                        //修改input节点的样式
                        newInputNode.style.height = nowEditTdNode.offsetHeight - 1  + 'px';
                        //绑定input节点的失焦事件
                        newInputNode.addEventListener('blur',function () {
                            tdInputBlur(newInputNode);
                        });
                        //input获取焦点
                        newInputNode.focus();
                    }
                }
            }
        })
    };

    /**
     * 方法：全局移动事件
     */
    _this.mouseMove_global = function () {
        //获取body节点
        let body = document.body;
        //获取当前点击节点
        let nowActNode;
        //存储全局提示框节点
        let globalTip;

        //绑定全局提示浮框事件
        body.addEventListener('mousemove',function (event) {
            event = event || window.event;
            nowActNode = event.target;
            if(nowActNode){
                if(!globalTip){
                    globalTip = document.getElementById('_qd_contentTextTip');
                    return;
                }
                _this.event_globalTipShowChange(event,nowActNode,globalTip);
                _this.event_globalTipMove(event,globalTip);
            }
        })
    };

    /**
     * 方法：用于初始化表格的选中样式
     */
    _this.init_tableStyle = function (tableObj) {
        //当前页面中qd-table的所有tr;
        let trArr = tableObj.getElementsByTagName('tr');
        //qd-table区域
        let qdTableArea = _this.parents(tableObj,'div[name="tableFather"]')[0];
        //获取tableId
        let tableId = qdTableArea.id;
        //获取当前td节点
        // let nowTdNode;
        //获取当前的复选框节点
        let nowCheckBoxNode;
        //暂时存储
        let shortTimeSave = {};
        //获取当前p节点
        // let actPObj;
        //获取当前div节点
        // let actDivObj;
        //获取当前input节点
        // let actInputObj;
        //获取div中所有的子节点
        // let actDivChildNodes;
        //清空选中下标
        selectTrIndexArr[tableId].splice(0,selectTrIndexArr[tableId].length);
        //遍历行集合
        for(let trKey in trArr){
            if(!isNaN(trKey) && trArr[trKey].getAttribute('name') != 'tableTitle'){
                if(trArr[trKey].className.indexOf('_global_trSelectBgColor') > -1){
                    //获取当前行的复选框节点
                    nowCheckBoxNode = trArr[trKey].getElementsByTagName('td')[0].getElementsByTagName('input')[0];
                    //若复选框选中
                    if(nowCheckBoxNode.checked){
                        //生成假event
                        shortTimeSave.target = nowCheckBoxNode;
                        //调用复选框的点击事件
                        _this.bindChangeEvent_checkbox(shortTimeSave,tableId);
                        //改变选中状态
                        nowCheckBoxNode.checked = !nowCheckBoxNode.checked;
                        //触发change事件
                        nowCheckBoxNode.onchange();
                    }else {
                        //去除行的选中样式
                        trArr[trKey].classList.remove('_global_trSelectBgColor');
                    }
                    /*for (let tdKey in tdArr){
                        if(!isNaN(tdKey)){
                            actPObj = tdArr[tdKey].getElementsByTagName('p');
                            if(actPObj.length != 0 && actPObj[0].className.indexOf('_global_displayNone') > -1){
                                actDivObj = actPObj[0].nextSibling;
                                actDivChildNodes = actDivObj.childNodes;
                                actInputObj = actDivChildNodes[0];
                                if(actDivChildNodes[2] !== undefined){
                                    if(actDivChildNodes[2].className.indexOf('_global_displayNone') < 0){
                                        actDivChildNodes[2].classList.add('_global_displayNone');
                                    }
                                }
                                actPObj[0].innerText = actInputObj.value;
                                actPObj[0].classList.remove('_global_displayNone');
                                actDivObj.classList.add('_global_displayNone');
                                break;
                            }
                        }
                    }
                    trArr[trKey].classList.remove('_global_trSelectBgColor');
                    break;*/
                }
            }
        }
    };

    /**
     * 方法：绑定复选框的change事件
     */
    _this.bindChangeEvent_checkbox = function (event,tableId) {
        //获取当前点击对象
        let nowActObj = event.target;
        //获取qd-table模块最外层对象
        let tableArea;
        //获取片段展示去中所有tr集合
        let trArr;
        //判定点击复选框类别，单选/全选
        let checkBoxType;
        //获取全选复选框对象
        let allSelectCheckBox;
        // let aloneSelectCheckBoxArr = [];
        // let actCheckBox;
        //存储内容展示区域对象
        let tableContentArea;
        //存储当前区域的tableId;
        // let tableId;
        //存储复选框总数
        let checkBoxTotal = 0;
        //获取点击的复选框的类别
        if(_this.parents(nowActObj,'td[name="dataItemSelect"]').length > 0){
            checkBoxType = 2;
        }else if(_this.parents(nowActObj,'th[name="dataAllSelect"]').length > 0){
            checkBoxType = 1;
        }else if(_this.parents(nowActObj,'td[name="dataAllSelect"]').length > 0){
            checkBoxType = 1;
        }else {
            checkBoxType = 0;
        }
        switch (checkBoxType){
            case 1:
                if(nowActObj.onchange == null){
                    nowActObj.onchange = function () {
                        let allSelectCBObj = this;
                        //获取表格的内容展示区
                        tableContentArea = _this.parents(allSelectCBObj, 'div._qd_tableTitleDiv')[0].nextElementSibling;
                        //获取tr集合
                        trArr = tableContentArea.getElementsByTagName('tr');
                        //获取复选框的总数
                        checkBoxTotal = dataSourceArr[tableId].length;
                        //必须先初始化，用于避免下标重复和通过全选按钮重置点击所有行的选中状态
                        selectTrIndexArr[tableId] = [];
                        //获取所有的下标集合，需要通过切换片段时进行复选框的选取，若一次性选取将造成卡顿
                        if (allSelectCBObj.checked) {
                            for (let index = 0; index < checkBoxTotal; index++) {
                                selectTrIndexArr[tableId].push(index + 1);
                            }
                        } else {
                            selectTrIndexArr[tableId] = [];
                        }
                        //全选当前页
                        _this.changeEvent_AllCheckBox(allSelectCBObj,trArr);
                        tableContentArea = null;
                    };
                }
                break;
            case 2:
                if(nowActObj.onchange == null){
                    nowActObj.onchange = function () {
                        //获取单选复选框
                        let aloneCBObj = this;
                        //获取复选框下标
                        let cbIndex = parseInt(_this.parents(aloneCBObj,'td')[0].nextSibling.textContent);
                        //定义下标集合
                        let indexInArray;
                        //获取复选框所在的行
                        let nowTrNode = _this.parents(aloneCBObj,'tr[name="tableContent"]')[0];
                        //获取数据源的子项数量
                        checkBoxTotal = dataSourceArr[tableId].length;
                        //获取当前最外层的区域对象
                        tableArea = document.getElementById(tableId);
                        //判定自定义头部还是默认头部
                        if(tableArea.getElementsByClassName('_qd_tableTitleDiv')[0].getElementsByTagName('table')[0].className.indexOf('_global_displayNone') < 0){
                            //获取全选复选框
                            allSelectCheckBox = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0].getElementsByTagName('table')[0].getElementsByTagName('th')[0].getElementsByTagName('input')[0];
                        }else {
                            //获取全选复选框
                            allSelectCheckBox = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0].getElementsByTagName('table')[1].getElementsByTagName('td')[0].getElementsByTagName('input')[0];
                        }
                        if (aloneCBObj.checked) {
                            //勾选上时加入对应的下标
                            if(_this.inArray(cbIndex,selectTrIndexArr[tableId]) < 0){
                                selectTrIndexArr[tableId].push(cbIndex);
                            }
                            //若行不存在选中样式
                            if(nowTrNode.className.indexOf('_global_trSelectBgColor') < 0){
                                nowTrNode.classList.add('_global_trSelectBgColor');
                            }
                        } else {
                            //取消勾选时去除对应的下标
                            indexInArray = _this.inArray(cbIndex,selectTrIndexArr[tableId]);
                            //当这个下标存在是才进行删除
                            if(indexInArray > -1){
                                //删除数组中对应下标
                                selectTrIndexArr[tableId].splice(indexInArray,1);
                            }
                            //若行存在选中样式
                            if(nowTrNode.className.indexOf('_global_trSelectBgColor') > -1){
                                nowTrNode.classList.remove('_global_trSelectBgColor');
                            }
                        }
                        _this.changeEvent_checkBox(tableId,allSelectCheckBox,selectTrIndexArr,checkBoxTotal);
                        allSelectCheckBox = null;
                        tableArea = null;
                    };
                }
                break;
            default:
                break;
        }
    };

    /**
     * 方法：复选框事件中的‘全选事件’
     * 调用到的模块：表格复选框模块，下拉列表复选框模块
     */
    _this.changeEvent_AllCheckBox = function (allSelectCBObj,nodeArr) {
        //遍历节点数组
        for (let nodeIndex in nodeArr) {
            //获取当前复选框
            let cbObj;
            if (!isNaN(nodeIndex)) {
                if(nodeArr[nodeIndex].getElementsByTagName('td').length != 0){
                    cbObj = nodeArr[nodeIndex].getElementsByTagName('td')[0].getElementsByTagName('input')[0];
                }else if(nodeArr[nodeIndex].getElementsByTagName('input').length != 0){
                    cbObj = nodeArr[nodeIndex].getElementsByTagName('input')[0];
                }else {
                    cbObj = nodeArr[nodeIndex];
                }
                cbObj.checked = allSelectCBObj.checked;
                //根据全选框的选中状态
                if(allSelectCBObj.checked){
                    //若当前行没有选中样式
                    if(nodeArr[nodeIndex].className.indexOf('_global_trSelectBgColor') < 0){
                        nodeArr[nodeIndex].classList.add('_global_trSelectBgColor');
                    }
                }else {
                    //若当前行有选中样式
                    if(nodeArr[nodeIndex].className.indexOf('_global_trSelectBgColor') > -1){
                        nodeArr[nodeIndex].classList.remove('_global_trSelectBgColor');
                    }
                }
            }
            cbObj = null;
        }
        allSelectCBObj = null;
        nodeArr = null
    };

    /**
     * 方法：复选框事件中的‘单选事件’
     * 调用到的模块：表格复选框模块，下拉列表复选框模块
     */
    _this.changeEvent_checkBox = function (tableId,allSelectCheckBox,selectTrIndexArr,checkBoxTotal) {
        //若选中下标集合的长度等于复选框总数量（除全选复选框）
        if(selectTrIndexArr[tableId].length == checkBoxTotal){
            allSelectCheckBox.checked = true;
        }else {
            allSelectCheckBox.checked = false;
        }
        for(let index in arguments){
            if(!isNaN(index)){
                arguments[index] = null;
            }
        }
    };

    /**
     * 方法：全局点击事件中的p标签点击事件，切换p和editBox，为editBox中的节点添加点击事件
     */
    _this.mouseDown_p = function (event) {
        let eventObj = event.target;
        let tableId;
        let pObj;
        let tdObj;
        let pBroDivObj;
        let divChildNodes;
        let textAreaObj;
        //存储input的值
        let inputValue;
        //存储当前行对象
        let nowTrObj;
        //获取数据在数据源里的下标
        let dataLevelIndex;
        //获取属性名
        let dataAttrName;
        //存储当前行的td数组
        let nowTdArr;
        //存储p标签兄弟节点的子节点
        let broChildNodes;
        //存储列表显示按钮对象
        let listShowBtnObj;
        if(eventObj.tagName.toLowerCase() == 'p' || (eventObj.tagName.toLowerCase() == 'td' && eventObj.getElementsByTagName('p').length > 0)){
            //获取td中的p对象
            pObj = (eventObj.tagName.toLowerCase() == 'p') ? eventObj : eventObj.getElementsByTagName('p')[0];
            //获取td对象
            tdObj = pObj.parentNode;
            //获取p的兄弟对象
            pBroDivObj = pObj.nextSibling;
            //获取兄弟对象中的子项
            divChildNodes = pBroDivObj.childNodes;
            //若最大宽没有设置，则根据td的可见宽度（不包含滚动条等）进行设置
            if(pObj.style.maxWidth == ''){
                pObj.style.maxWidth = tdObj.offsetWidth + 'px';
            }
            //根据可见高度设置高度
            pBroDivObj.style.height = tdObj.clientHeight + 'px';
            for(let nodeIndex in divChildNodes){
                if(!isNaN(nodeIndex) && divChildNodes[nodeIndex].tagName.toLowerCase() == 'textarea'){
                    textAreaObj = divChildNodes[nodeIndex];
                    break;
                }
            }
            //初始化文本输入框的height
            textAreaObj.style.height = tdObj.clientHeight + 'px';
            if(textAreaObj.onkeydown == null){
                textAreaObj.onkeydown = function () {
                    this.style.height = this.scrollHeight + 'px';
                    pBroDivObj.style.height = this.scrollHeight + 'px';
                }
            }
            if(_this.parents(pObj,'div._qd_batchEditDiv').length != 0){
                tableId = _this.parents(pObj,'div._qd_batchEditDiv')[0].getAttribute('idvalue');
            }else {
                tableId = _this.parents(pObj,'div[name="tableFather"]')[0].id;
            }
            //赋值
            textAreaObj.value = pObj.innerText;
            if(textAreaObj.onblur == null){
                textAreaObj.onblur = function () {
                    nowTrObj = _this.parents(tdObj,'tr')[0];
                    nowTdArr = nowTrObj.getElementsByTagName('td');
                    for(let tdKey in nowTdArr){
                        if(!isNaN(tdKey) && nowTdArr[tdKey].getAttribute('name') == 'dataItemId'){
                            dataLevelIndex = Number(nowTdArr[tdKey].textContent) - 1;
                            break;
                        }
                    }
                    dataAttrName = tdObj.getAttribute('attrname');
                    inputValue = textAreaObj.value;
                    //改写数据源里的数据
                    dataSourceArr[tableId][dataLevelIndex][dataAttrName] = inputValue;
                    //改写p的内容;
                    tdObj.firstElementChild.textContent = inputValue;
                };
            }
            //获取p标签兄弟节点的子项
            broChildNodes = pBroDivObj.childNodes;
            //用于绑定列表btn的点击事件
            for(let nodeKey in broChildNodes){
                if(!isNaN(nodeKey) && broChildNodes[nodeKey].tagName.toLowerCase() == 'button'){
                    listShowBtnObj = broChildNodes[nodeKey];
                    if(listShowBtnObj.className.indexOf('_global_displayNone') < 0){
                        if(listShowBtnObj.onmousedown == null){
                            listShowBtnObj.onmousedown = function (event) {
                                let btnObj = this;
                                if(event.button == 0){
                                    _this.mouseDown_btn(tableId,btnObj);
                                }
                            }
                        }
                    }else {
                        //消除没有关联数据时的点击事件
                        if(listShowBtnObj.onmousedown != null){
                            listShowBtnObj.onmousedown = null;
                        }
                    }
                }
            }
            //p标签隐藏
            pObj.classList.add('_global_displayNone');
            //p标签的下个兄弟标签显示
            pBroDivObj.classList.remove('_global_displayNone');
            //input标签获取焦点
            textAreaObj.focus();
        }
    };

    /**
     * 方法：editBox中下拉框按钮的点击事件
     */
    _this.mouseDown_btn = function (tableId,btnObj) {
        //获取点击到的td表格
        let tdObj = _this.parents(btnObj,'td[name="dataValue"]')[0];
        //获取列表对象
        let listObj = btnObj.nextSibling;
        //修改列表的top
        listObj.style.top = tdObj.clientHeight + 'px';
        //展示并初始化列表
        if(listObj.className.indexOf('_global_displayNone') > -1){
            if(listObj.tagName.toLowerCase() == 'div'){
                _this.init_moreSelectList(listObj);
            }
            listObj.classList.remove('_global_displayNone');
        }else {
            listObj.classList.add('_global_displayNone');
        }
        //若列表对象是ul
        if(listObj.tagName.toLowerCase() == 'ul'){
            if(listObj.onmousedown == null){
                listObj.onmousedown = function (event) {
                    if(event.button == 0){
                        _this.mouseDown_aloneSelectList(event);
                    }
                }
            }
        //若列表对象是div
        }else if (listObj.tagName.toLowerCase() == 'div'){
            if(listObj.onmousedown == null){
                listObj.onmousedown = function (event) {
                    let list = this;
                    if(event.button == 0){
                        console.log('我点击了');
                        _this.mouseDown_moreSelectList(event,list);
                    }
                }
            }
        }
    };

    /**
     * 方法：editBox中单选下拉列表的点击事件
     */
    _this.mouseDown_aloneSelectList = function (event) {
        let textareaObj;
        let ulObj;
        let liObj = event.target;
        if(liObj.tagName.toLowerCase() == 'li'){
            //获取列表对象
            ulObj = _this.parents(liObj,'ul')[0];
            //获取input对象
            textareaObj = ulObj.parentNode.childNodes[0];
            //修改input的值
            textareaObj.value = liObj.textContent;
            //隐藏ul列表
            ulObj.classList.add('_global_displayNone');
            //为了触发input的blur事件
            textareaObj.focus();
            textareaObj.blur();
        }
    };

    /**
     * 方法：多选下拉框初始化
     */
    _this.init_moreSelectList = function (listObj) {
        let textareaObj = _this.parents(listObj,'div._qd_divSize')[0].childNodes[0];
        let valueArr = textareaObj.value.split(',');
        let liArr = listObj.getElementsByTagName('ul')[0].getElementsByTagName('li');
        let liValue;
        let liCB;
        let selectAllCB = listObj.childNodes[1].getElementsByTagName('input')[0];
        let isAllSelect = true;

        for (let liKey in liArr){
            if(!isNaN(liKey)){
                liValue = liArr[liKey].getElementsByTagName('p')[0].textContent;
                liCB = liArr[liKey].getElementsByTagName('input')[0];
                if(_this.inArray(liValue,valueArr) > -1){
                    liCB.checked = true;
                }else {
                    isAllSelect = false;
                    liCB.checked = false;
                }
            }
        }
        selectAllCB.checked = isAllSelect;
    };

    /**
     * 方法：editBox中多选下拉列表的点击事件
     */
    _this.mouseDown_moreSelectList = function (tableId,event,listObj) {
        let nowActObj = event.target;
        let selectAllCheckBox = listObj.getElementsByClassName('_qd_allSelectDivSize')[0].getElementsByTagName('input')[0];
        let liArr = listObj.getElementsByTagName('ul')[0].getElementsByTagName('li');
        let selectAloneCheckBoxArr = [];
        let trueSelAloneCBArr;
        let selectAloneUl = _this.parents(nowActObj,'ul._qd_moreSelectUlSize');
        let selectAllDiv = _this.parents(nowActObj,'div._qd_allSelectDivSize');
        let btnDiv = _this.parents(nowActObj,'div._qd_moreSelectBtnDivSize');
        let liObj;
        let selectAloneCB;
        let selValArr = [];
        let returnStr = '';
        let textAreaObj;

        for(let liKey in liArr){
            if(!isNaN(liKey)){
                selectAloneCheckBoxArr.push(liArr[liKey].getElementsByTagName('input')[0]);
            }
        }

        if(nowActObj.tagName.toLowerCase() != 'ul' && selectAloneUl.length > 0){
            if(nowActObj.tagName.toLowerCase() == 'li'){
                liObj = nowActObj;
            }else {
                liObj = _this.parents(nowActObj,'li._qd_moreSelectLiSize')[0];
            }
            selectAloneCB = liObj.getElementsByTagName('input')[0];
            if(selectAloneCB.onchange == null){
                selectAloneCB.onchange = function () {
                    trueSelAloneCBArr = [];
                    selectAloneCheckBoxArr.forEach(function (cbObj) {
                        if(cbObj.checked){
                            trueSelAloneCBArr.push(cbObj);
                        }
                    });
                    _this.changeEvent_checkBox(tableId,selectAllCheckBox,trueSelAloneCBArr, selectAloneCheckBoxArr.length);
                }
            }
            if(nowActObj.tagName.toLowerCase() != 'input'){
                selectAloneCB.checked = !selectAloneCB.checked;
                selectAloneCB.onchange();
            }
        }else if(nowActObj.tagName.toLowerCase() == 'div' && nowActObj.className.indexOf('_qd_allSelectDivSize') > -1 || selectAllDiv.length > 0){
            if(selectAllCheckBox.onchange == null){
                selectAllCheckBox.onchange = function () {
                    _this.changeEvent_AllCheckBox(selectAllCheckBox,selectAloneCheckBoxArr);
                }
            }
            if(nowActObj.tagName.toLowerCase() != 'input'){
                selectAllCheckBox.checked = !selectAllCheckBox.checked;
                selectAllCheckBox.onchange();
            }
        }else if(nowActObj.tagName.toLowerCase() == 'button' && btnDiv.length > 0){
            if(nowActObj.onmouseup == null){
                nowActObj.onmouseup = function (event) {
                    if(event.button == 0){
                        if(nowActObj.textContent == '确定'){
                            selValArr = [];
                            returnStr = '';
                            textAreaObj = _this.parents(listObj,'div._qd_divSize')[0].firstElementChild;
                            selectAloneCheckBoxArr.forEach(function (cb) {
                                if(cb.checked){
                                    selValArr.push(cb.nextSibling.textContent);
                                }
                            });
                            if(selValArr.length > 0){
                                returnStr = selValArr.join(',');
                            }
                            textAreaObj.value = returnStr;
                            textAreaObj.focus();
                            textAreaObj.blur();
                            listObj.classList.add('_global_displayNone');
                        }else {
                            listObj.classList.add('_global_displayNone');
                        }
                    }
                }
            }
        }
    };

    /**
     * 方法：load页面展示隐藏，可添加提示语句
     */
    _this.show_loadingPage = function (isShow,showTip) {
        showTip = showTip || '';
        let loadingObj = document.getElementById('_qd_loading');
        if(isShow && loadingObj.className.indexOf('_global_displayNone') > -1){
            loadingObj.classList.remove('_global_displayNone');
            loadingObj.getElementsByTagName('p')[0].innerText = showTip;
        }else if(!isShow && loadingObj.className.indexOf('_global_displayNone') < 0){
            loadingObj.classList.add('_global_displayNone');
        }
        loadingObj = null;
    };

    /*========================================  * 竖直滚动事件模块 *  ==========================================*/
    /**
     * 方法：绑定tableContentArea(展示区域)的滚动事件
     */
    _this.event_tableContentDivScroll = function (tableArea) {
        //存储tableId
        let tableId = tableArea.getAttribute('id');
        //内容区域对象
        let contentDivObj = tableArea.lastElementChild;
        //获取冻结承载框
        let freezeColDiv = tableArea.getElementsByClassName('_qd_tableContentDiv')[0].getElementsByClassName('_qd_freColDiv');
        //内容区域滚动条长度
        let scrollHeight;
        //滚动条滑块的高度
        let scrollSliderHeight;
        //滚动条距离顶部的距离
        let scrollTop;
        //滚动条距离底部的距离
        let scrollBottom;
        //内容区域的第一个子项
        let firstChildNode;
        //内容区域的最后一个子项
        let lastChildNode;
        //记录子项的在数据源集合里的下标
        let tableIndex;
        //经过顶部
        let isTop = true;
        //经过底部
        let isBottom = true;
        //存储当前区域内table片段的集合
        let contentTableArr = contentDivObj.getElementsByTagName('table');
        //存储要保留的片段的总高度
        let keepPartHeight = 0;
        //存储要插入的新片段
        let actNewTablePart = null;
        //获取展示框高度
        let showDivHeight;
        //获取冻结列片段集合
        let freezeColPartArr;
        //获取新提取的冻结片段
        let newFreezeColPart;

        tableArea = null;
        //初始计算滑块长度（不需要计算）
        // scrollSliderHeight = _this.get_sliderHeight(contentDivObj);

        //绑定滚动事件
        contentDivObj.onscroll = function () {
            //scrollHeight是指元素的完整的高度，并非滚动条的长度
            scrollHeight = this.scrollHeight;
            //scrollTop是指元素实际顶部距离展示顶部的距离，并非滚动条顶部距滑块顶部的距离
            scrollTop = this.scrollTop;
            //展示框的高度
            showDivHeight = this.clientHeight;
            scrollBottom = scrollHeight - (scrollTop + showDivHeight);
            if(scrollTop < (scrollHeight - showDivHeight)/2){
                isBottom = true;
            }else {
                isTop = true;
            }
            if(scrollTop < 1 && isTop){
                if(finalTableArr[tableId].length == 0){
                    return;
                }
                isTop = false;
                firstChildNode = this.firstElementChild;
                tableIndex = parseInt(firstChildNode.getAttribute('levelindex'));
                if(tableIndex != 0){
                    //获取要插入的table片段对象
                    actNewTablePart = _this.dealWith_tablePart(tableId, tableIndex - 1, 'before');
                    //修改新片段的节点的宽度
                    // _this.reset_tableChildNodeWidth(actNewTablePart);
                    //当插入片段不为null时执行下面代码
                    if(actNewTablePart != null){
                        //插入新片段
                        contentDivObj.insertBefore(actNewTablePart,firstChildNode);
                        //更新冻结承载框中的内容
                        if(freezeColDiv.length != 0){
                            //获取冻结承载框中所有子项
                            freezeColPart = freezeColDiv[0].getElementsByTagName('table');
                            //获取新的冻结列片段
                            newFreezeColPart = _this.get_freezeContentColPart(tableId,actNewTablePart);
                            //将冻结列片段插入第一个子项之前
                            freezeColDiv[0].insertBefore(newFreezeColPart,freezeColPart[0]);
                        }
                        //清除新片段的引用
                        actNewTablePart = null;
                        //获取区域内除最后一个片段的所有片段的总高度的高度大于区域的高
                        for(let tableKey in contentTableArr){
                            if(!isNaN(tableKey) && tableKey < contentTableArr.length - 1){
                                keepPartHeight += contentTableArr[tableKey].offsetHeight;
                            }
                        }
                        //当keepPartHeight > 2倍区域的高且片段数大于2，则移除最后一个片段
                        if(keepPartHeight > 2 * contentDivObj.offsetHeight && contentTableArr.length > 2){
                            //避免删除了冻结承载框
                            if(contentDivObj.lastElementChild.tagName.toLowerCase() == 'table'){
                                contentDivObj.removeChild(contentDivObj.lastElementChild);
                            }else {
                                contentDivObj.removeChild(contentDivObj.lastElementChild.previousElementSibling);
                            }
                            //若冻结承载框存在，则删除最后一个片段；
                            if(freezeColDiv.length != 0){
                                //将最后一个子项删除
                                freezeColDiv[0].removeChild(freezeColDiv[0].lastElementChild);
                            }
                        }
                        // contentFreezePart = _this.get_freezeContentColPart(tableId,shortTimeSave[index]);
                        //清零，防止数据叠加
                        keepPartHeight = 0;
                        this.scrollTop = (this.scrollHeight - showDivHeight)/2;
                    }
                    isTop = true;
                    isBottom = true;
                }
            }else if(scrollBottom < 1 && isBottom){
                if(finalTableArr[tableId].length == 0){
                    return;
                }
                //记录是否到达底部
                isBottom = false;
                //获取展示区中最后的table片段
                lastChildNode = this.lastElementChild;
                //获取table片段的下标
                tableIndex = parseInt(lastChildNode.getAttribute('levelindex'));
                //若下标小于片段集合的最后一个下标时执行
                if(tableIndex < finalTableArr[tableId].length - 1){
                    //获取要插入的table片段对象
                    actNewTablePart = _this.dealWith_tablePart(tableId, tableIndex + 1, 'after');
                    //修改新片段的节点宽度
                    // _this.reset_tableChildNodeWidth(actNewTablePart);
                    // actNewTablePart = _this.delete_partChildrenItem(tableId,tableIndex + 1,'after');
                    //当插入片段不为null时执行下面代码
                    if(actNewTablePart != null){
                        //插入新片段(需要插入在冻结承载框之前);
                        if(contentDivObj.lastElementChild.tagName.toLowerCase() == 'table'){
                            contentDivObj.appendChild(actNewTablePart);
                        }else {
                            contentDivObj.insertBefore(actNewTablePart,contentDivObj.lastElementChild);
                        }
                        //更新冻结承载框中的内容
                        if(freezeColDiv.length != 0){
                            //获取新的冻结列片段
                            newFreezeColPart = _this.get_freezeContentColPart(tableId,actNewTablePart);
                            //将冻结列片段插入到最后
                            freezeColDiv[0].appendChild(newFreezeColPart);
                        }
                        //清除片段的引用
                        actNewTablePart = null;
                        //获取区域内除第一个片段的所有片段的总高度的高度
                        for(let tableKey in contentTableArr){
                            if(!isNaN(tableKey) && tableKey > 0){
                                keepPartHeight += contentTableArr[tableKey].offsetHeight;
                            }
                        }
                        //当keepPartHeight > 区域的高，则移除第一个片段
                        if(keepPartHeight > 2 * contentDivObj.offsetHeight && contentTableArr.length > 2){
                            contentDivObj.removeChild(contentDivObj.firstElementChild);
                            if(freezeColDiv.length != 0){
                                //删除第一个冻结片段
                                freezeColDiv[0].removeChild(freezeColDiv[0].firstElementChild);
                            }
                        }
                        //清零，防止数据叠加
                        keepPartHeight = 0;
                        this.scrollTop = (this.scrollHeight - showDivHeight)/2;
                    }
                    isTop = true;
                    isBottom = true;
                }
            }
        }
    };

    /*========================================  * 表格展示区列拖拽模块 *  ==========================================*/

    /**
     * 方法：绑定table展示区的mouseMove事件
     */
    _this.bind_tableContentArea = function (tableId,contentArea) {
        contentArea.removeEventListener('mousemove',_this.event_tableContentDragLine);
        contentArea.addEventListener('mousemove',_this.event_tableContentDragLine);
    };

    /**
     * 方法：table展示区的拖拽线判定事件
     */
    _this.event_tableContentDragLine = function (event) {
        event = event || window.event;
        //当移动过的地点是序号和复选框时不执行以下代码；
        if(event.target.className.indexOf('_qd_headColumn') > -1){
            return;
        }
        //若拖拽事件触发时，不执行下列代码
        if(isLineDrag){
            return;
        }
        //获取当前节点
        let nowActNode = event.target;
        //获取鼠标左距离
        let mouseLeft;
        //获取当前节点的属性名
        let nowAttrName = nowActNode.getAttribute('attrname');
        //获取table区域
        let tableArea = _this.parents(nowActNode,'div[name="tableFather"]')[0];
        //存储tableId
        let tableId = tableArea.id;
        //获取横向滚动区域
        let hScrollDiv = tableArea.parentNode;
        //存储滚动距离
        let hScrollLength;
        //存储分界线的位置
        let trueLeft;
        //获取表格展示区节点
        let tableContentArea = _this.parents(nowActNode,'div._qd_tableContentDiv')[0];
        //获取表头展示区节点
        let tableTitleArea = tableContentArea.previousElementSibling;
        //存储table展示区的top
        let tableContentTop = _this.get_elePositionTop(tableContentArea);
        //存储拖拽线节点
        let VLine = document.getElementById('vLineDiv');
        //获取序号节点
        let idNode = tableContentArea.getElementsByTagName('tr')[0].getElementsByClassName('_qd_headColumn');
        //存储dragLine的最左值
        let LineLeft = _this.get_elePositionLeft(tableContentArea);
        //存储dragLine的最右值
        let LineRight = _this.get_elePositionLeft(tableContentArea);
        //暂时存储
        let shortTimeSave = null;

        //若滚动区域存在，则需要更新mouseLeft
        hScrollLength = (hScrollDiv == null) ? 0 : hScrollDiv.scrollLeft;
        //获取mouseLeft
        mouseLeft = parseInt(hScrollLength + event.pageX);

        //若左右值为节点对象则先清空
        if(leftNode !== undefined && leftNode.nodeType !== undefined){
            leftNode = {};
        }else if(leftNode === undefined){
            leftNode = {};
        }
        if(rightNode !== undefined && rightNode.nodeType !== undefined){
            rightNode = {};
        }else if(rightNode === undefined){
            rightNode = {};
        }
        //获取line所能移动的最左值
        for(let index in idNode){
            if(!isNaN(index) && idNode[index].className.indexOf('_global_displayNone') < 0){
                LineLeft += idNode[index].clientWidth;
            }
        }
        //获取line所能移动的最右值
        LineRight += tableContentArea.clientWidth;

        //重新获取分界线的位置
        trueLeft = _this.get_elePositionLeft(nowActNode);
        //鼠标需要在序号的右边和表格的左边是才执行以下代码（+- 5是为了防止范围值触发下列代码）
        if(mouseLeft > LineLeft + 30 && mouseLeft < LineRight - 30){
            // console.log('进来了',trueLeft,trueLeft,mouseLeft > trueLeft - 5 && mouseLeft < trueLeft + 5);
            //当鼠标在当前节点的左边时
            if(mouseLeft > trueLeft - 5 && mouseLeft < trueLeft + 5
                && (parseInt(VLine.style.left) != trueLeft - 5 || parseInt(VLine.style.top) != tableContentTop)){
                //套个保险：以防拖拽线出现时修改了左值和右值
                if(nowActNode.id != 'vLineDiv' && nowActNode.className.indexOf('_qd_vLine') < 0){
                    //若左右值的tableId不相同则重新写入所有属性
                    if(rightNode.tableId != tableId){
                        //获取上一个兄弟节点
                        shortTimeSave = nowActNode.previousElementSibling;
                        //若兄弟节点是隐藏的就再获取上一个兄弟节点（写在判定里面是要避免不必要的循环）
                        while (shortTimeSave.className.indexOf('_global_displayNone') > 0){
                            shortTimeSave = shortTimeSave.previousElementSibling;
                        }
                        //重新写入tableId
                        leftNode.tableId = tableId;
                        rightNode.tableId = tableId;
                        //重新写入属性名
                        leftNode.attrName = shortTimeSave.getAttribute('attrname');
                        rightNode.attrName = nowAttrName;
                        //存储节点宽度
                        leftNode.nodeWidth = shortTimeSave.clientWidth;
                        rightNode.nodeWidth = nowActNode.clientWidth;
                    }else if(rightNode.attrName != nowAttrName){
                        //获取上一个兄弟节点
                        shortTimeSave = nowActNode.previousElementSibling;
                        //若兄弟节点是隐藏的就再获取上一个兄弟节点（写在判定里面是要避免不必要的循环）
                        while (shortTimeSave.className.indexOf('_global_displayNone') > 0){
                            shortTimeSave = shortTimeSave.previousElementSibling;
                        }
                        //重新写入属性名
                        leftNode.attrName = shortTimeSave.getAttribute('attrname');
                        rightNode.attrName = nowAttrName;
                        //存储节点宽度
                        leftNode.nodeWidth = shortTimeSave.clientWidth;
                        rightNode.nodeWidth = nowActNode.clientWidth;
                    }
                }
                //改变拖拽线的left位置
                VLine.style.left = trueLeft - hScrollLength - 5 + 'px';
            //当鼠标在当前节点的右边时
            }else if(mouseLeft > trueLeft + nowActNode.clientWidth - 5 && mouseLeft < trueLeft + nowActNode.clientWidth + 5
                && (parseInt(VLine.style.left) != trueLeft + nowActNode.clientWidth - 5 || parseInt(VLine.style.top) != tableContentTop)){
                //套个保险：以防拖拽线出现时修改了左值和右值
                if(nowActNode.id != 'vLineDiv' && nowActNode.className.indexOf('_qd_vLine') < 0){
                    //若左右值的tableId不相同则重新写入所有属性
                    if(leftNode.tableId != tableId){
                        //获取上一个兄弟节点
                        shortTimeSave = nowActNode.nextElementSibling;
                        //若兄弟节点是隐藏的就再获取上一个兄弟节点（写在判定里面是要避免不必要的循环）
                        while (shortTimeSave.className.indexOf('_global_displayNone') > 0){
                            shortTimeSave = shortTimeSave.nextElementSibling;
                        }
                        //重新写入tableId
                        leftNode.tableId = tableId;
                        rightNode.tableId = tableId;
                        //重新写入属性名
                        leftNode.attrName = nowAttrName;
                        rightNode.attrName = shortTimeSave.getAttribute('attrname');
                        //存储节点宽度
                        leftNode.nodeWidth = nowActNode.clientWidth;
                        rightNode.nodeWidth = shortTimeSave.clientWidth;
                    }else if(rightNode.attrName != nowAttrName){
                        //获取上一个兄弟节点
                        shortTimeSave = nowActNode.nextElementSibling;
                        //若兄弟节点是隐藏的就再获取上一个兄弟节点（写在判定里面是要避免不必要的循环）
                        while (shortTimeSave.className.indexOf('_global_displayNone') > 0){
                            shortTimeSave = shortTimeSave.nextElementSibling;
                        }
                        //重新写入属性名
                        leftNode.attrName = nowAttrName;
                        rightNode.attrName = shortTimeSave.getAttribute('attrname');
                        //存储节点宽度
                        leftNode.nodeWidth = nowActNode.offsetWidth;
                        rightNode.nodeWidth = shortTimeSave.offsetWidth;
                    }
                }
                //改变拖拽线的left位置
                VLine.style.left = trueLeft - hScrollLength - 5 + 'px';
            }
            //设置拖拽线的top位置
            VLine.style.top = tableContentTop + 'px';
            //设置拖拽线的height
            VLine.style.height = tableContentArea.clientHeight + 'px';
            //改变拖拽线中线的长度
            VLine.firstElementChild.style.height = tableContentArea.clientHeight + tableTitleArea.clientHeight + 'px';
            //改变拖拽线中线的top
            VLine.firstElementChild.style.marginTop = -1 * tableTitleArea.clientHeight + 'px';
        }
    };

    /**
     * 方法：用于修改表格片段的宽度
     */
    _this.reset_tableChildNodeWidth = function (tableId,tablePart) {
        //获取col节点集合
        let colNodeArr;
        //获取表格节点集合
        let nodeArr;
        //获取table区域节点
        let tableArea = document.getElementById(tableId);
        //获取节点宽度集合
        let widthArr = nodeWidthArr[tableId];
        //获取当前界定属性
        let nowAttrName;
        //获取当前片段的片段下标
        let levelIndex;
        //暂时存储
        let shortTimeSave;
        //存储表格宽度
        let tableFinalWidth;
        //获取当前table节点
        let tablePartArr;
        //获取表头区域
        let tableTitleArea = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0];
        //获取表头table
        let titleTableArr = tableTitleArea.getElementsByTagName('table');
        //获取表格中的th/td节点
        if(tablePart.getElementsByTagName('th').length > 0){
            nodeArr = tablePart.getElementsByTagName('th');
        }else {
            nodeArr = tablePart.getElementsByTagName('td');
        }
        //获取tablePart中的col节点集合
        colNodeArr = tablePart.getElementsByTagName('col');
        //当片段中的levelIndex 存在时获取片段下标
        if(tablePart.getAttribute('levelindex')){
            levelIndex = tablePart.getAttribute('levelindex');
        }
        //若width数据不为空时，根据数据中的width值修改节点的width
        if(widthArr.length > 0) {
            if(levelIndex === undefined){
                //获取宽度数据
                shortTimeSave = widthArr[0].data;
            }else if(widthArr[levelIndex] !== undefined){
                //当获取到存在的数据时，直接获取并将原本数据设置为undefined
                if(widthArr[levelIndex].isReset){
                    shortTimeSave = widthArr[levelIndex].data;
                    widthArr[levelIndex].isReset = false;
                }
            }else if(widthArr[levelIndex] === undefined){
                //直接深层copy第一个列宽情况
                widthArr[levelIndex] = JSON.parse(JSON.stringify(widthArr[0]));
                //数据赋值给暂时存储
                shortTimeSave = widthArr[levelIndex].data;
            }
            //若暂时存储为undefined,则不执行修改宽度的代码
            if(shortTimeSave !== undefined){
                //初始化宽度
                tableFinalWidth = 0;
                //计算tableFinalWidth的宽度
                if(tablePart.parentNode != null && _this.parents(tablePart,'div._qd_tableTitleDiv').length > 0){
                    tableFinalWidth = 101;
                    Object.keys(shortTimeSave).forEach(function (key) {
                        tableFinalWidth += shortTimeSave[key] + 1;
                    })
                }else{
                    for(let index in titleTableArr){
                        if(!isNaN(index) && titleTableArr[index].className.indexOf('_global_displayNone') < 0){
                            tableFinalWidth = titleTableArr[index].offsetWidth;
                            break;
                        }
                    }
                }
                //若存在col标签
                if(colNodeArr.length !== 0){
                    for (let index in colNodeArr){
                        if(!isNaN(index) && colNodeArr[index].getAttribute('name')){
                            nowAttrName = colNodeArr[index].getAttribute('name');
                            colNodeArr[index].setAttribute('width',shortTimeSave[nowAttrName] + 'px');
                        }
                    }
                }else {
                    //循环执行修改宽度代码
                    for (let index in nodeArr) {
                        if (!isNaN(index) && nodeArr[index].getAttribute('attrname')) {
                            //获取当前的属性名
                            nowAttrName = nodeArr[index].getAttribute('attrname');
                            //若存在数据则修改节点
                            nodeArr[index].style.width = shortTimeSave[nowAttrName] + 'px';
                        }
                    }
                }
                if(tablePart.parentNode !== null){
                    //获取tablePart节点
                    tablePartArr = tablePart.parentNode.getElementsByTagName('table');
                    //遍历节点
                    for(let index in tablePartArr){
                        if(!isNaN(index)){
                            tablePartArr[index].style.width = tableFinalWidth + 'px';
                        }
                    }
                    tablePart.parentNode.style.width = tableFinalWidth + contentAreaScrollDivWidth + 'px';
                }else {
                    tablePart.style.width = tableFinalWidth + 'px';
                }
                //获取列宽改变后的表格宽度,不可这么取的原因是当片段没插入页面时，offsetWidth = 0;
                // tableFinalWidth = _this.parents(nodeArr[0],'tr')[0].offsetWidth;
                //修改tableArea的宽度,tableFinalWidth + 'px'
                if(tableFinalWidth > document.body.clientWidth){
                    //修改宽度
                    tableArea.style.width = tableFinalWidth + contentAreaScrollDivWidth + 'px';
                }else {
                    //删除标签内宽度
                    tableArea.style.width = "";
                }
            }
        }
    };

    /**
     * 方法：改变表头的列宽度
     */
    /*_this.reset_tableTitleColWidth = function (tablePart) {
        //获取表格节点集合
        let nodeArr;
        //存储当前的节点属性名
        let nowAttrName;
        //存储当前的修改次数
        let resetNum = 0;
        //当存在th节点时，该片段为默认节点，否则自定义节点
        if(tablePart.getElementsByTagName('th').length > 0){
            //获取th节点
            nodeArr = tablePart.getElementsByTagName('th');
        }else{
            //获取td节点
            nodeArr = tablePart.getElementsByTagName('td');
        }
        //循环节点
        for(let index in nodeArr){
            if(!isNaN(index) && nodeArr[index].getAttribute('attrname')){
                //获取当前属性名
                nowAttrName = nodeArr[index].getAttribute('attrname');
                //当前节点的属性名与左右值的关系
                if(nowAttrName == leftNode.attrName){
                    //当前节点加上左值的偏移量
                    // nodeArr[index].style.width = nodeArr[index].clientWidth + leftNode.move + 'px';
                    nodeArr[index].style.width = leftNode.nodeWidth + 'px';
                    console.log(nodeArr[index]);
                    resetNum += 1;
                }else if(nowAttrName == rightNode.attrName){
                    //当前节点加上右值的偏移量
                    // nodeArr[index].style.width = nodeArr[index].clientWidth + rightNode.move + 'px';
                    nodeArr[index].style.width = rightNode.nodeWidth + 'px';
                    console.log(nodeArr[index]);
                    resetNum += 1;
                }
                //若修改次数 = 2时，跳出循环
                if(resetNum == 2){
                    break;
                }
            }
        }
    };*/

    /**
     * 方法：改变表格的列宽度
     */
    /*_this.reset_tableContentColWidth = function (tablePart) {
        //获取表格节点集合
        let nodeArr = tablePart.getElementsByTagName('td');
        //存储当前的节点属性名
        let nowAttrName;
        //获取片段下标（冻结框中的片段与展示去中的片段都有levelIndex,无法通过这个来区别）
        let levelIndex = tablePart.getAttribute('levelindex');
        //获取tableId
        let tableId = _this.parents(tablePart,'div._qd_tableDivSize')[0].id;
        //获取拖拽数据集合
        let dragDataArr = dragColWidthArr[tableId][levelIndex];
        //获取单个拖拽数据
        let itemData;
        //记录修改次数
        let resetNum = 0;
        //根据片段对应的拖拽数据进行循环
        while (dragDataArr.length > 0){
            //获取并删除数组的第一个子项数据
            itemData = dragDataArr.shift();
            //循环节点
            for(let index in nodeArr){
                if(!isNaN(index) && nodeArr[index].getAttribute('attrname')){
                    //获取当前属性名
                    nowAttrName = nodeArr[index].getAttribute('attrname');
                    //当前节点的属性名与左右值的关系
                    if(nowAttrName == itemData.leftNode.attrName){
                        //当前节点加上左值的偏移量
                        // nodeArr[index].style.width = nodeArr[index].clientWidth + itemData.leftNode.move + 'px';
                        nodeArr[index].style.width = itemData.leftNode.nodeWidth + 'px';
                        resetNum += 1;
                    }else if(nowAttrName == itemData.rightNode.attrName){
                        console.log(nodeArr[index].clientWidth)
                        //当前节点加上右值的偏移量
                        // nodeArr[index].style.width = nodeArr[index].clientWidth + itemData.rightNode.move + 'px';
                        nodeArr[index].style.width = itemData.rightNode.nodeWidth + 'px';
                        resetNum += 1;
                    }
                    //若修改次数等于2，则重置为0，并跳出
                    if(resetNum == 2){
                        resetNum = 0;
                        break;
                    }
                }
            }
        }

    };*/

    /**
     * 方法：插入拖动的基准线
     */
    _this.append_dragLine = function() {
        //定义竖线的html
        let VLine = '<div id="vLineDiv" class="_qd_vLineDiv"><div class="_qd_vLine _global_displayNone"></div></div>';
        //获取直接子节点
        //获取竖向线节点
        let VLineNode = _this.domNode(VLine)[0];

        _this.append_nodeToBodyEnd(VLineNode);
        _this.event_VLineDrag(VLineNode);

        VLineNode = null;
    };

    /**
     * 方法：绑定竖向基准线的拖动事件
     */
    _this.event_VLineDrag = function(VLine) {
        VLine = VLine || document.getElementById('vLineDiv');
        let line = VLine.firstElementChild;
        let oldLeft;
        let newLeft;
        let dragMoveLength;
        let mouseLineLength;

        let ev;
        //存储临时偏移量
        let shortTimeLength;
        //临时存储
        let shortTimeSave;
        //存储tableId
        let tableId;
        //获取当前qd-table的区域
        let tableArea;
        //获取功能按钮展示区域
        let funcBtnArea;
        //获取当前表头的展示区域
        let tableTitleArea;
        //获取当前表格展示区域;
        let tableContentArea;
        //获取分页信息行区域
        let tablePageInfoArea;
        //获取table片段集合
        let tablePartArr;
        //存储body
        let body = document.body;
        //获取直接子节点
        let childNodes;
        //获取新数据子项
        let newDataItem;
        //获取当前属性名
        let nowAttrName;
        //获取表格区域的最外层承载框
        let fatherDiv;

        isLineDrag = false;

        //绑定点击事件
        if(VLine.onmousedown == null){
            VLine.onmousedown = function (event) {
                ev = event || window.event;
                if(ev.button == 0){
                    //表示正在拖拽
                    isLineDrag = true;
                    //获取线框的初始左距离
                    oldLeft = _this.get_elePositionLeft(VLine);
                    //改变竖向的颜色
                    line.classList.remove('_global_displayNone');
                    //改变竖向线的margin-top
                    // line.style.marginTop = -1 * VLine.offsetHeight/10 + 'px';
                    //获取鼠标与线框的相对距离
                    mouseLineLength = ev.pageX - parseInt(VLine.style.left);
                }
            }
        }
        //绑定移动事件（此处移动事件必须绑定在document上，否则会出现移出div等情况）
        body.addEventListener('mousemove',function (event) {
            ev = event || window.event;
            //拖动拖拽线
            if(isLineDrag){
                shortTimeLength = ev.pageX - oldLeft;
                if(shortTimeLength < 0){
                    if(leftNode.nodeType === undefined){//table表格
                        //修改线框的位置
                        VLine.style.left = (shortTimeLength*(-1) < leftNode.nodeWidth - 30) ? ev.pageX - mouseLineLength + 'px' : oldLeft - leftNode.nodeWidth + 30 + 'px';
                    }else {//弹出框
                        //修改线框的位置
                        VLine.style.left = (shortTimeLength*(-1) < leftNode.offsetWidth - 30) ? ev.pageX - mouseLineLength + 'px' : oldLeft - leftNode.offsetWidth + 30 + 'px';
                    }
                } else {//table表格
                    if(rightNode.nodeType === undefined){//table表格
                        //修改线框的位置
                        VLine.style.left = ev.pageX - mouseLineLength + 'px';
                    }else {//弹出框
                        VLine.style.left = (shortTimeLength < rightNode.offsetWidth - 20) ? ev.pageX - mouseLineLength + 'px' : oldLeft + rightNode.offsetWidth - 30 + 'px';
                    }
                    //修改线框的位置
                    // VLine.style.left = ev.pageX - mouseLineLength + 'px';
                    /*if(rightNode.nodeType === undefined){
                        VLine.style.left = (shortTimeLength < rightNode.nodeWidth - 20) ? ev.pageX - mouseLineLength + 'px' : oldLeft + rightNode.nodeWidth - 30 + 'px';
                    }else {
                        //修改线框的位置
                        VLine.style.left = (shortTimeLength < rightNode.offsetWidth - 20) ? ev.pageX - mouseLineLength + 'px' : oldLeft + rightNode.offsetWidth - 30 + 'px';
                    }*/
                }
            }
        });
        //绑定点击松开事件
        body.addEventListener('mouseup',function (event) {
            //当拖拽线事件没被触发时，不执行下列代码
            if(!isLineDrag){
                return;
            }
            ev = event || window.event;
            isLineDrag = false;
            //计算线框的新位置
            newLeft = _this.get_elePositionLeft(VLine);
            //将线隐藏
            line.classList.add('_global_displayNone');
            //计算拖拉的距离
            dragMoveLength = newLeft - oldLeft;
            //当nodeType为undefined的时候，leftNode存储表格的信息，否则，leftNode存储节点信息
            if(leftNode.nodeType !== undefined){//用来拖拽修改弹出框的宽度
                /**
                 * 拖拉只改变左右宽度，不改变表格宽度
                 * leftNode.style.width = leftNode.offsetWidth + dragMoveLength + 'px';//重新设置左节点的宽度
                 * rightNode.style.width = (leftNode.parentNode.offsetWidth - leftNode.offsetWidth > 0) ? leftNode.parentNode.offsetWidth - leftNode.offsetWidth + 'px' : -1 * (leftNode.parentNode.offsetWidth - leftNode.offsetWidth) + 'px';//重新设置右节点的宽度
                 */
                //若操作节点是表格节点
                if(leftNode.tagName.toLowerCase() == 'td' || leftNode.tagName.toLowerCase() == 'th'){//以防万一，写上表格的判定条件
                    //获取左节点的属性名
                    let attrName = leftNode.getAttribute('attrname');
                    //获取table父框
                    let tableNode = _this.parents(leftNode,'table[name="qd-table"]')[0];
                    //获取col节点集合
                    let colNodes = tableNode.getElementsByTagName('col');
                    //若存在col标签
                    if(colNodes.length != 0){
                        //遍历col节点
                        for(let index in colNodes){
                            if(!isNaN(index) && colNodes[index].getAttribute('name') == attrName){
                                colNodes[index].setAttribute('width',leftNode.offsetWidth + dragMoveLength + 'px');
                            }
                        }
                    }else {
                        //重新设置左节点的宽度
                        leftNode.style.width = leftNode.offsetWidth + dragMoveLength + 'px';
                        //重新设置右节点的宽度
                        // rightNode.style.width = (leftNode.parentNode.offsetWidth - leftNode.offsetWidth > 0) ? leftNode.parentNode.offsetWidth - leftNode.offsetWidth + 'px' : -1 * (leftNode.parentNode.offsetWidth - leftNode.offsetWidth) + 'px';
                    }
                    //修改父table的宽度
                    tableNode.style.width = tableNode.offsetWidth + dragMoveLength + 'px';
                    //获取tableArea
                    tableArea = _this.parents(leftNode,'div[name="tableFather"]')[0];
                    //重新设置全局宽度，_this.parents(leftNode,'tr[name="tableContent"]')[0].offsetWidth + 'px'
                    if(tableArea.offsetWidth + dragMoveLength > document.body.clientWidth){
                        tableArea.style.width = tableArea.offsetWidth + dragMoveLength + contentAreaScrollDivWidth + 'px';
                    } else {
                        tableArea.style.width = "";
                    }
                    //重新设置左节点的宽度
                    // leftNode.style.width = leftNode.offsetWidth + dragMoveLength + 'px';
                }else {
                    //重新设置左节点的宽度
                    leftNode.style.width = leftNode.offsetWidth + dragMoveLength + 'px';
                    //重新设置右节点的宽度
                    rightNode.style.width = (leftNode.parentNode.offsetWidth - leftNode.offsetWidth > 0) ? leftNode.parentNode.offsetWidth - leftNode.offsetWidth + 'px' : -1 * (leftNode.parentNode.offsetWidth - leftNode.offsetWidth) + 'px';
                }
            }else {//用来修改表格的宽度
                //修改左值中的nodeWidth
                leftNode.nodeWidth += dragMoveLength;
                //修改右值中的nodeWidth
                // rightNode.nodeWidth += (-1) * dragMoveLength;
                //将偏移信息存储入左值
                leftNode.move = dragMoveLength;
                //将偏移信息存储入右值
                // rightNode.move = -1 * dragMoveLength;
                //获取tableId
                tableId = leftNode.tableId;
                //获取当前的table区域
                tableArea = document.getElementById(tableId);
                //获取当前表格区域
                tableContentArea = tableArea.getElementsByClassName('_qd_tableContentDiv')[0];
                //获取展示区的直接子节点
                childNodes = tableContentArea.childNodes;
                //获取其中一行tr的节点
                for(let index in childNodes){
                    if(!isNaN(index) && childNodes[index].tagName.toLowerCase() == 'table'){
                        //获取其中一行tr中的td集合，并直接跳出循环
                        shortTimeSave = childNodes[index].getElementsByTagName('tr')[0].getElementsByTagName('td');
                        break;
                    }
                }
                //初始化newDataItem
                if(newDataItem === undefined){
                    newDataItem = {};
                }
                //循环获取每个存在属性的展示节点的宽度
                for (let index in shortTimeSave){
                    //需要节点不隐藏且存在attrName这个属性
                    if(!isNaN(index) && shortTimeSave[index].getAttribute('attrname') && shortTimeSave[index].className.indexOf('_global_displayNone') < 0){
                        nowAttrName = shortTimeSave[index].getAttribute('attrname');
                        if(newDataItem.data === undefined){
                            newDataItem.data = {};
                        }
                        newDataItem.data[nowAttrName] = parseInt(shortTimeSave[index].offsetWidth);
                    }
                }
                //将左值中的新宽度赋值到新数据项中
                newDataItem.data[leftNode.attrName] = leftNode.nodeWidth;
                /**
                 * 第一版：要修改右节点的宽度
                 * newDataItem.data[rightNode.attrName] = rightNode.nodeWidth;//将右值中的新宽度赋值到新数据项中
                 */
                //修改isReset属性
                newDataItem.isReset = true;
                //根据table片段集合来分配宽度数据
                if(isSendOver){//当数据加载完
                    finalTableArr[tableId].forEach(function (item,index) {
                        nodeWidthArr[tableId][index] = JSON.parse(JSON.stringify(newDataItem));
                    });
                }else {//当数据还没加载完
                    for(let index = 0;index < pageNum[tableId]; index++){
                        nodeWidthArr[tableId][index] = JSON.parse(JSON.stringify(newDataItem));
                    }
                }
                //获取当前表头区域
                tableTitleArea = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0];
                //获取tableTitleArea区域的表头片段集合（包括冻结框中）
                tablePartArr = tableTitleArea.getElementsByTagName('table');
                //将当前所有表头片段进行列宽修改
                for(let index in tablePartArr){
                    if(!isNaN(index)){
                        _this.reset_tableChildNodeWidth(tableId,tablePartArr[index]);
                    }
                }
                //获取tableContentArea区域的表格片段集合（包括冻结框中）
                tablePartArr = tableContentArea.getElementsByTagName('table');
                //获取当前所有表格片段进行列宽修改
                for(let index in tablePartArr){
                    if(!isNaN(index)){
                        _this.reset_tableChildNodeWidth(tableId,tablePartArr[index]);
                    }
                }
            }
            //判定表格最外层父框是否出现滚动条
            if(tableId !== undefined){
                fatherDiv = document.getElementById(tableId).parentNode;
            }else {
                if(leftNode.tagName.toLowerCase() == 'td' && _this.parents(leftNode,'div._qd_batchEditContentArea').length == 0){
                    fatherDiv = _this.parents(leftNode,'div[name="tableFather"]')[0].parentNode;
                }
            }
            //若father不为undefined
            if(fatherDiv !== undefined){
                //获取功能按钮区
                funcBtnArea = fatherDiv.getElementsByClassName('_qd_funBtnDivSize')[0];
                //获取表头展示区
                tableTitleArea = fatherDiv.getElementsByClassName('_qd_tableTitleDiv')[0];
                //获取内容展示区
                tableContentArea = fatherDiv.getElementsByClassName('_qd_tableContentDiv')[0];
                //获取分页信息行
                tablePageInfoArea = fatherDiv.getElementsByClassName('_qd_pagingInfoDiv');
                //重新设置内容展示区的最大高度
                tableContentArea.style.maxHeight = fatherDiv.clientHeight - tableTitleArea.offsetHeight - funcBtnArea.offsetHeight - ((tablePageInfoArea.length > 0) ? tablePageInfoArea[0].offsetHeight : 0) + 'px';
            }
        });
    };

    /**
     * 方法：重置拖拽线的位置
     */
    _this.reset_dragLinePlace = function () {
        let VLine = document.getElementById('vLineDiv');
        //重置拖拽线的位置
        VLine.style.left = '';
        VLine.style.top = '';
        //重置拖拽线的长度
        VLine.firstElementChild.style.height = '';
        //重置拖拽线的位置
        VLine.firstElementChild.style.marginTop = '';
    };

    /*========================================  * 分页模块 *  ==========================================*/

    /**
     * 方法：初始化分页信息行和绑定页码点击事件
     */
    _this.init_tablePage = function(pageAmount,tableId,initIndex) {
        //决定分页信息中第几个页面被选中
        initIndex = initIndex || 1;
        //页面数，若没有table片段也需要有一个页码存在
        pageAmount = (pageAmount == 0) ? 1 : pageAmount;
        //获取横向滚动区域对象
        let scrollDiv = document.getElementById(tableId).parentNode;
        //获取分页信息行
        let pagingArea = document.getElementById(tableId + '_pagingInfo');
        //分页信息行的左部分
        let leftHalf = pagingArea.getElementsByClassName('_qd_pagingInfoLeftArea')[0];
        //分页信息行的中间部分
        let midHalf = pagingArea.getElementsByClassName('_qd_pagingInfoMidArea')[0];
        //分页信息行的右部分
        let rightHalf = pagingArea.getElementsByClassName('_qd_pagingInfoRightArea')[0];
        //决定中间的页码（所有页码中）
        let midIndex = (pageAmount % 2 == 0) ? pageAmount/2 : (pageAmount + 1)/2;
        //获取滚动框的实际宽度
        let trueWidth = scrollDiv.offsetWidth;
        //提示的html
        let tipHtml;
        //中间页面按钮的html
        let midBtnHtml = '';
        //按钮集合
        let btnArr;
        //输入框对象
        let inputObj;
        //跳转按钮集合
        let jumpBtnObj;

        //重置分页数
        pageNum[tableId] = pageAmount;

        //初始化分页信息行中三模块信息
        //左文字提示清空
        leftHalf.getElementsByClassName('_qd_pagingInfoTip')[0].innerHTML = '';
        //中间按钮清空
        midHalf.getElementsByClassName('_qd_pagingInfoPageIndexDiv')[0].innerHTML = '';
        //右input清空
        rightHalf.getElementsByClassName('_qd_pagingInfoJumpInput')[0].value = '';

        //设定分页信息行的宽度
        pagingArea.style.width = trueWidth + 'px';
        //生成左部分的提示信息
        tipHtml = '第<mark>' + initIndex + '</mark>页,共' + pageAmount + '页';
        //当页面 > 5时，页码按钮只显示5个，其余用'···'显示
        if(pageAmount > 5){
            midBtnHtml = '<button><mark>1</mark></button><button><mark>2</mark></button><p>···</p><button><mark>'+ midIndex +'</mark></button>' +
                '<p>···</p><button><mark>'+ (pageAmount - 1) +'</mark></button><button><mark>'+ pageAmount +'</mark></button>';
        }else {
            for(let index = 0;index < pageAmount;index ++){
                midBtnHtml += '<button><mark>' + (index + 1) + '</mark></button>';
            }
        }
        //写入提示
        leftHalf.getElementsByTagName('p')[0].innerHTML = tipHtml;
        //写入按钮
        midHalf.getElementsByClassName('_qd_pagingInfoPageIndexDiv')[0].innerHTML = midBtnHtml;
        //获取按钮对象集合
        btnArr = midHalf.getElementsByClassName('_qd_pagingInfoPageIndexDiv')[0].getElementsByTagName('button');
        //为默认按钮添加选中样式
        for(let index in btnArr){
            if(!isNaN(index) && btnArr[index].getElementsByTagName('mark')[0].textContent == initIndex){
                btnArr[index].classList.add('_qd_pagingInfoSelectBtn');
            }
        }
        //获取input对象
        inputObj = rightHalf.getElementsByTagName('input')[0];
        //获取button对象
        jumpBtnObj = rightHalf.getElementsByTagName('button')[0];
        //绑定中间按钮的点击事件
        if(midHalf.onmousedown == null){
            midHalf.onmousedown = function(event){
                _this.midBtnEvent(event,tableId);
            };
        }
        //绑定跳转的输入事件
        if(inputObj.oninput == null){
            inputObj.oninput = function () {
                _this.jumpPageInput(tableId,inputObj);
            };
        }
        //绑定跳转的按钮事件
        if(jumpBtnObj.onmousedown == null){
            jumpBtnObj.onmousedown = function () {
                _this.jumpBtnEvent(jumpBtnObj);
            }
        }
        //释放内存
        pagingArea = null;
        leftHalf = null;
        midHalf = null;
        rightHalf = null;
    };

    /**
     * 方法：分页信息行中部按钮的点击事件
     */
    _this.midBtnEvent = function(event,tableId) {
        //获取点击对象
        let actObj = event.target;
        //存储按钮的text
        let btnText;
        //存储配置信息
        let config;
        //获取展示区域
        let tableContentArea;
        //获取当前片段下标
        let tableIndex;
        //存储查询方向
        let type;
        if(actObj && event.button == 0 && actObj.tagName.toLowerCase() == 'button'){
            tableContentArea = _this.parents(actObj,'div._qd_pagingInfoDiv')[0].previousElementSibling;
            tableIndex = parseInt(tableContentArea.getElementsByTagName('table')[0].getAttribute('levelindex')) + 1;
            //释放缓存
            tableContentArea = null;
            btnText = actObj.getElementsByTagName('mark')[0].textContent;
            if(actObj.parentNode.className.indexOf('_qd_pagingInfoPageIndexDiv') > -1){
                type = (parseInt(btnText) > tableIndex) ? 'after' : 'before';
                //中间页数按钮
                if(actObj.className.indexOf('_qd_pagingInfoSelectBtn') < 0){
                    if(btnText > finalTableArr[tableId].length){
                        _this.show_loadingPage(true,'正在写入余下的数据，请稍后');
                        sendOverTime = setInterval(function () {
                            if(isSendOver){
                                _this.show_loadingPage(false);
                                _this.pageIndexBtnEvent(actObj,parseInt(btnText),tableId,type);
                                clearInterval(sendOverTime);
                            }
                        },500)
                    }else {
                        _this.pageIndexBtnEvent(actObj,parseInt(btnText),tableId,type);
                    }
                }
            }else {
                //首末页，上下页按钮
                switch (btnText){
                    case '首页':
                        config = 1;
                        break;
                    case '上一页':
                        if(tableIndex > 1){
                            config = tableIndex - 1;
                        }else {
                            config = 1;
                        }
                        break;
                    case '下一页':
                        if(tableIndex < pageNum[tableId]){
                            config = tableIndex + 1;
                        }else {
                            config = pageNum[tableId];
                        }
                        break;
                    case '末页':
                        config = pageNum[tableId];
                        break;
                    default:
                        break;
                }
                if(config != tableIndex){
                    type = (config > tableIndex) ? 'after' : 'before';
                    if(config > finalTableArr[tableId].length){
                        _this.show_loadingPage(true,'正在写入余下的数据，请稍后');
                        sendOverTime = setInterval(function () {
                            if(isSendOver){
                                _this.show_loadingPage(false);
                                _this.pageIndexBtnEvent(actObj,config,tableId,type);
                                clearInterval(sendOverTime);
                            }
                        },500)
                    }else {
                        _this.pageIndexBtnEvent(actObj,config,tableId,type);
                    }
                }
            }
        }
    };

    /**
     * 方法：分页信息行中部按钮的点击事件
     */
    _this.pageIndexBtnEvent = function(btnObj,tableIndex,tableId,type) {
        //获取页码按钮区域
        let btnDiv = _this.parents(btnObj,'div._qd_pagingInfoDiv')[0].getElementsByClassName('_qd_pagingInfoPageIndexDiv')[0];
        //中部table展示区
        let tableContentArea = _this.parents(btnObj,'div._qd_pagingInfoDiv')[0].previousElementSibling;
        //真实table片段下标
        let trueIndex = tableIndex - 1;
        //获取提示区域
        let pagingTipDiv = _this.parents(btnObj,'div._qd_pagingInfoMidArea')[0].previousElementSibling;
        //获取点击按钮对应的页数
        // let pageIndex = btnObj.getElementsByTagName('mark')[0].textContent;
        //获取处理后的片段对象
        let newActTablePart = _this.dealWith_tablePart(tableId, trueIndex, type);
        //_this.delete_partChildrenItem(tableId,trueIndex,type);

        //修改页码按钮样式
        _this.reset_pagingIndexBtnSelStyle(btnDiv,parseInt(tableIndex));
        //修改提示
        _this.reset_pagingTip(pagingTipDiv,parseInt(tableIndex));
        if(newActTablePart != null){
            //删除展示区域内的子项
            tableContentArea.removeChild(tableContentArea.firstElementChild);
            //插入新子项
            tableContentArea.appendChild(newActTablePart);
        }
    };

    /**
     * 方法：分页信息行中跳转页面的输入事件
     */
    _this.jumpPageInput = function(tableId,inputObj) {
        let value = inputObj.value;
        let newValue;
        newValue = value.replace(/[^0-9]/g,'');
        if(newValue > pageNum[tableId]){
            newValue = pageNum[tableId];
        }else if(newValue == 0 && newValue != ''){
            newValue = 1;
        }
        inputObj.value = newValue;
    };

    /**
     * 方法：分页信息行中跳转页面按钮点击事件
     */
    _this.jumpBtnEvent = function(btnObj) {
        let inputObj = btnObj.previousElementSibling;
        //获取input的值
        let inputValue = inputObj.value;
        //获取分页信息区域对象
        let pagingInfoDiv = btnObj.parentNode.parentNode;
        //获取展示区域
        let tableContentArea = pagingInfoDiv.previousElementSibling;
        //存储table片段下标
        let newTableIndex = parseInt(inputValue) - 1;
        //获取中部页码按钮区域
        let pageIndexBtnDiv = pagingInfoDiv.getElementsByClassName('_qd_pagingInfoMidArea')[0].getElementsByClassName('_qd_pagingInfoPageIndexDiv')[0];
        //获取提示区域
        let pagingTipDiv = pagingInfoDiv.getElementsByClassName('_qd_pagingInfoLeftArea')[0];
        //获取当前显示片段的下标
        let pageIndex;
        //获取tableId
        let tableId = _this.parents(tableContentArea,'div[name="tableFather"]')[0].id;
        //获取处理后的片段对象
        // let newActTablePart = _this.dealWith_tablePart(tableId, trueIndex, type);

        if(inputValue == ''){
            return;
        }
        if(inputValue > finalTableArr[tableId].length && finalTableArr[tableId].length != pageNum[tableId]){
            _this.show_loadingPage(true,'正在写入余下的数据，请稍后');
            sendOverTime = setInterval(function () {
                if(isSendOver){
                    _this.show_loadingPage(false);
                    pageIndex = parseInt(tableContentArea.firstElementChild.getAttribute('levelindex'));
                    //当新跳转的页面不跟当前页面重复才进行跳转
                    if(pageIndex + 1 != inputValue){
                        //删除展示区域的子项
                        tableContentArea.removeChild(tableContentArea.firstElementChild);
                        //添加新的table片段
                        tableContentArea.appendChild(finalTableArr[tableId][newTableIndex]);
                        //修改页面按钮样式
                        _this.reset_pagingIndexBtnSelStyle(pageIndexBtnDiv,parseInt(inputValue));
                        //修改提示
                        _this.reset_pagingTip(pagingTipDiv,parseInt(inputValue));
                    }
                    inputObj = null;
                    pagingInfoDiv = null;
                    tableContentArea = null;
                    pageIndexBtnDiv = null;
                    pagingTipDiv = null;
                    clearInterval(sendOverTime);
                }
            },500)
        }else {
            pageIndex = parseInt(tableContentArea.firstElementChild.getAttribute('levelindex'));
            //当新跳转的页面不跟当前页面重复才进行跳转
            if(pageIndex + 1 != inputValue){
                //删除展示区域的子项
                tableContentArea.removeChild(tableContentArea.firstElementChild);
                //添加新的table片段
                tableContentArea.appendChild(finalTableArr[tableId][newTableIndex]);
                //修改页面按钮样式
                _this.reset_pagingIndexBtnSelStyle(pageIndexBtnDiv,parseInt(inputValue));
                //修改提示
                _this.reset_pagingTip(pagingTipDiv,parseInt(inputValue));
            }
            inputObj = null;
            pagingInfoDiv = null;
            tableContentArea = null;
            pageIndexBtnDiv = null;
            pagingTipDiv = null;
        }
    };

    /**
     * 方法：用于修改页码按钮的选中样式
     */
    _this.reset_pagingIndexBtnSelStyle = function(btnDiv, newIndex) {
        let btnArr = btnDiv.getElementsByTagName('button');
        let btnIndex = btnArr.length%2 + parseInt(btnArr.length/2) - 1;
        let isFindBtn = false;

        //初始化样式
        for (let index in btnArr){
            if(!isNaN(index) && btnArr[index].className.indexOf('_qd_pagingInfoSelectBtn') > -1){
                btnArr[index].classList.remove('_qd_pagingInfoSelectBtn');
                break;
            }
        }
        //为选中按钮添加选择样式
        for(let index in btnArr){
            if(!isNaN(index) && btnArr[index].getElementsByTagName('mark')[0].textContent == newIndex){
                btnArr[index].classList.add('_qd_pagingInfoSelectBtn');
                isFindBtn = true;
                break;
            }
        }
        //若找不到对应按钮，则将中间的页码按钮的值改为newIndex，并赋给选中样式
        if(!isFindBtn){
            btnArr[btnIndex].getElementsByTagName('mark')[0].innerText = newIndex;
            if(btnArr[btnIndex].className.indexOf('_qd_pagingInfoSelectBtn') < 0 ){
                btnArr[btnIndex].classList.add('_qd_pagingInfoSelectBtn');
            }
        }
    };

    /**
     * 方法：用于修改分页信息行的提示
     */
    _this.reset_pagingTip = function(tipDiv, newIndex) {
        let pObj = tipDiv.getElementsByTagName('p')[0];
        //修改页码
        pObj.getElementsByTagName('mark')[0].innerText = newIndex;
    };

    /*========================================  * table横向滚动事件模块 *  ==========================================*/

    /**
     * 方法：绑定qd-table父框的滚动监听
     */
    _this.scroll_tableAreaFather = function (tableArea) {
        //获取tableId;
        let tableId = tableArea.getAttribute('id');
        //最外层横向滚动框
        let scrollDiv = tableArea.parentNode;
        //存储功能按钮的承载框
        let funBtnDiv = tableArea.getElementsByClassName('_qd_funBtnDivSize')[0].firstElementChild;
        //获取分页信息行对象
        let pagingDiv = document.getElementById(tableId + '_pagingInfo');
        //table区域内所有存在冻结类的节点集合
        let tableFreezeArr = tableArea.getElementsByClassName('_qd_freezeColumn');

        //绑定功能按钮区的滚动事件
        _this.scroll_funBtn(funBtnDiv,scrollDiv);
        //绑定冻结列的滚动事件
        // _this.scroll_freezeColumn(tableId,tableFreezeArr,scrollDiv);
        //绑定分页信息行的滚动事件
        if(pagingDiv != null){
            _this.scroll_pagingDiv(pagingDiv,scrollDiv);
        }
    };

    /**
     * 方法：功能按钮随滚动条滚动而滚动
     */
    _this.scroll_funBtn = function (BtnArea,scrollDiv) {
        let btnDivToScrollLeft = _this.get_eleToFatherLeft(BtnArea,scrollDiv);
        let trueLeft;
        let btnScrollEvent;
        let trueScrollLeft;
        btnScrollEvent = function () {
            trueScrollLeft = scrollDiv.scrollLeft;
            trueLeft = (trueScrollLeft > btnDivToScrollLeft) ? trueScrollLeft - btnDivToScrollLeft : 0;
            BtnArea.style.left = (trueLeft == 0) ? 0 : trueLeft + 'px';
        };
        scrollDiv.removeEventListener('scroll',btnScrollEvent);
        scrollDiv.addEventListener('scroll',btnScrollEvent);
    };

    /**
     * 方法：设置分页信息行的横向滚动事件
     */
    _this.scroll_pagingDiv = function (pagingDiv,scrollDiv) {
        let pagingDivToScrollLeft = _this.get_eleToFatherLeft(pagingDiv,scrollDiv);
        let trueLeft;
        let pagingScrollEvent;
        let trueScrollLeft;
        pagingScrollEvent = function () {
            trueScrollLeft = scrollDiv.scrollLeft;
            trueLeft = (trueScrollLeft > pagingDivToScrollLeft) ? trueScrollLeft - pagingDivToScrollLeft : 0;
            pagingDiv.style.left = (trueLeft == 0) ? 0 : trueLeft + 'px';
        };
        scrollDiv.removeEventListener('scroll',pagingScrollEvent);
        scrollDiv.addEventListener('scroll',pagingScrollEvent);
    };

    /*========================================  * 冻结列模块 *  ==========================================*/
    /**
     * 方法：初始化冻结列承载框
     */
    _this.init_freezeColDiv = function (tableId) {
        //获取qd-table区域
        let tableArea = document.getElementById(tableId);
        //获取表头区域
        let tableTitleDiv = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0];
        //获取内容区域
        let tableContentDiv = tableArea.getElementsByClassName('_qd_tableContentDiv')[0];
        //暂时存储
        let shortTimeSave;
        //暂时存储宽
        let shortTimeWidth;
        //暂时存储高
        let shortTimeHeight;
        //存储node集合
        let nodeArr;
        //存储tableHtml;
        let tableHtml = freezeColTableHtml;
        //获取头部显示片段
        let nowTitlePart;
        //获取头部冻结片段
        let titleFreezePart;
        //获取内容显示片段
        let nowContentPart;
        //获取内容冻结片段
        let contentFreezePart;
        //存储table片段集合
        let tablePartArr;
        //获取头部片段
        shortTimeSave = tableTitleDiv.getElementsByTagName('table');
        if(shortTimeSave.length > 1){
            nowTitlePart = shortTimeSave[1];
        }else {
            nowTitlePart = shortTimeSave[0];
        }
        //将冻结列表承载框写入表头区域并将序号写入
        shortTimeSave = _this.domNode(freezeColDiv)[0];
        shortTimeSave.classList.add('_qd_freColDiv');
        shortTimeSave.setAttribute('name','freezeTitle');
        tableTitleDiv.appendChild(shortTimeSave);
        titleFreezePart = _this.get_freezeTitleColPart(tableId,nowTitlePart);
        //插入tableHtml
        shortTimeSave.appendChild(titleFreezePart);

        //获取当前内容展示去的table片段
        tablePartArr = tableContentDiv.getElementsByTagName('table');
        /*//将序号写入
         if(tableTitleDiv.getElementsByTagName('table').length > 1){
         //存在自定义标签
         nodeArr = tableTitleDiv.getElementsByTagName('table')[1].getElementsByTagName('td');
         }else {
         nodeArr = tableTitleDiv.getElementsByTagName('table')[0].getElementsByTagName('th');
         }
         for(let index in nodeArr){
         if(!isNaN(index) && nodeArr[index].getAttribute('name') == 'dataItemIdName'){
         //获取序号节点的实际宽度
         shortTimeWidth = nodeArr[index].offsetWidth;
         //获取序号节点的实际高度
         shortTimeHeight = nodeArr[index].offsetHeight;
         //获取序号的html并插入
         shortTimeSave.innerHTML = nodeArr.outerHTML;
         //获取新序号节点
         shortTimeSave = shortTimeSave.getElementsByTagName('_qd_headColumn')[0];
         //写入实际宽度
         shortTimeSave.style.width = shortTimeWidth;
         //写入实际高度
         shortTimeSave.style.height = shortTimeHeight;
         }
         }*/

        //将冻结列表承载框写入内容区域并将序号写入
        shortTimeSave = _this.domNode(freezeColDiv)[0];
        shortTimeSave.classList.add('_qd_freColDiv');
        shortTimeSave.setAttribute('name','freezeContent');
        tableContentDiv.appendChild(shortTimeSave);
        //根据内容table片段进行冻结片段生成
        for(let index in tablePartArr){
            if(!isNaN(index)){
                nowContentPart = tablePartArr[index];
                contentFreezePart = _this.get_freezeContentColPart(tableId,nowContentPart);
                shortTimeSave.appendChild(contentFreezePart);
            }
        }


        /*//获取当前展示区内容的table片段集合
         tablePartArr = tableContentDiv.getElementsByTagName('table');
         for(let index in tablePartArr){
         if(!isNaN(index)){
         //将当前片段中的冻结列提取写入
         _this.status_freezePart(tableId,tablePartArr[index]);
         }
         }*/
        shortTimeSave = null;
    };

    /**
     * 方法：绑定冻结列横向滚动事件
     */
    _this.scroll_freezeColumn = function (tableId,freezeDivArr,scrollDiv) {
        let freezeColNameArr = freezeColumnAttrNameArr[tableId];
        let freezeColLeftArr = freezeColumnTrueLeftArr[tableId];
        let freezeColEvent;
        let trueScrollLeft;
        //获取当前还没展示的冻结列属性名
        let nowFreezeColName;
        //暂时存储
        let shortTimeSave;
        //冻结列的滚动事件
        freezeColEvent = function () {
            if(!(freezeColumnTrueLeftArr[tableId] != undefined && freezeColumnAttrNameArr[tableId] != undefined)){
                return;
            }
            if(!(freezeColumnTrueLeftArr[tableId].toString() != '{}' && freezeColumnAttrNameArr[tableId].length != 0)){
                return;
            }
            //获取滚动距离
            trueScrollLeft = scrollDiv.scrollLeft;
            //重新写入每个承载框的距左距离
            for(let index in freezeDivArr){
                if(!isNaN(index)){
                    freezeDivArr[index].style.left = trueScrollLeft + 'px';
                }
            }
            //获取当前需要展示的最右边的冻结列
            if(trueScrollLeft < freezeColLeftArr[freezeColNameArr[0]]){
                shortTimeSave = null;
            }else {
                for(let index in freezeColNameArr){
                    if(!isNaN(index) ){
                        if(trueScrollLeft > freezeColLeftArr[freezeColNameArr[index]]){
                            shortTimeSave = freezeColNameArr[index];
                        }else {
                            break;
                        }
                    }
                }
            }
            //当新的需要展示的冻结列与原右端的冻结列不相同时，触发冻结承载框的宽度变化
            if(shortTimeSave != nowFreezeColName){
                nowFreezeColName = shortTimeSave;
                _this.status_freezePart(tableId,trueScrollLeft,freezeDivArr,shortTimeSave);
            }
        };
        scrollDiv.removeEventListener('scroll',freezeColEvent);
        scrollDiv.addEventListener('scroll',freezeColEvent);
    };

    /**
     * 方法：冻结table中的列并存储数据进数组
     */
    _this.freeze_column = function (tableId,attrName) {
        //获取所有展示列
        let showColumn = configDataArr[tableId].showColumn.attrNameArr;
        //获取属性名集合
        let attrNameArr;
        //当前内容部分
        // let nowContentPart;

        if(!(showColumn == 'all' || showColumn instanceof Array)){
            return;
        }
        //初始化冻结列片段集合
        if(freezeColPart[tableId] === undefined){
            freezeColPart[tableId] = [];
        }
        //初始化全局变量
        if(freezeColumnAttrNameArr[tableId] === undefined){
            freezeColumnAttrNameArr[tableId] = [];
        }
        if(freezeColumnTrueLeftArr[tableId] === undefined){
            freezeColumnTrueLeftArr[tableId] = {}
        }
        //获取当前tableId对应的冻结列名称集合
        attrNameArr = freezeColumnAttrNameArr[tableId];
        //当需要冻结新列的时候，需要修改已经冻结的内容
        isFreeze = true;
        //若冻结片段集合不为undefined,且集合内存有数据时将数据子项中的isReFreeze属性重置
        if(freezeColPart[tableId] !== undefined && freezeColPart[tableId].length != 0){
            freezeColPart[tableId].forEach(function (part) {
                part.isReFreeze = true;
            })
        }
        //将属性名写入冻结列数组
        if(attrName instanceof Array){
            attrName.forEach(function (item) {
                //当冻结列在冻结列表中不存在时
                if(_this.inArray(item,attrNameArr) < 0){
                    //当展示列为all
                    if(showColumn == 'all'){
                        attrNameArr.push(item);
                    //当展示列不为all时，需要判定冻结列是否为展示的列
                    }else if(_this.inArray(item,showColumn) > -1){
                        attrNameArr.push(item);
                    }
                }
            })
        }else if(typeof attrName == 'string'){
            //若该属性名在原冻结列中不存在时，则执行下列代码
            if(_this.inArray(attrName,attrNameArr) < 0){
                //若展示全部列时写入
                if(showColumn == 'all'){
                    attrNameArr.push(attrName);
                //若在展示数组中存在时写入
                }else if(_this.inArray(attrName,showColumn) > -1){
                    attrNameArr.push(attrName);
                }
            }
        }
        //根据冻结信息生成冻结片段并插入
        _this.get_freezeColPart(tableId);
        /*for(let index in freezeColDiv){
            if(!isNaN(index)){
            }
        }*/
        /*//处理承载框中的内容
        for(let index in freezeColDiv){
            if(!isNaN(index)){
                _this.status_freezePart(tableId,scrollDiv.scrollLeft,freezeColDiv[index]);
            }
        }*/
        /*//获取表头片段
        if(tableArea.getElementsByClassName('_qd_tableTitleDiv')[0].getElementsByTagName('table').length > 1){
            nowTitlePart = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0].getElementsByTagName('table')[1];
        }else {
            nowTitlePart = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0].getElementsByTagName('table')[0];
        }
        //获取内容片段
        nowContentPart = tableArea.getElementsByClassName('_qd_tableContentDiv')[0].getElementsByTagName('table');*/
        /*//修改表头状态
        _this.status_freezePart(tableId,nowTitlePart);
        //修改表格状态
        for (let index in nowContentPart){
            if(!isNaN(index)){
                _this.status_freezePart(tableId,nowContentPart[index]);
            }
        }*/
    };

    /**
     * 方法：根据冻结信息生成冻结片段并插入
     */
    _this.get_freezeColPart = function (tableId) {
        //获取qd-table区域
        let tableArea = document.getElementById(tableId);
        //获取table展示区中一行td的集合,必须是当前在展示区存在的行
        let tableTdArr = tableArea.getElementsByClassName('_qd_tableContentDiv')[0].getElementsByTagName('tr')[0].getElementsByTagName('td');
        //获取节点宽度集合
        let nodeWidthArr = {};
        //获取当前tableId对应的冻结列名称集合
        let attrNameArr = freezeColumnAttrNameArr[tableId];
        //获取当前tableId对应的冻结列左距离集合
        let trueLeftArr = freezeColumnTrueLeftArr[tableId];
        //获取name
        let name;
        //获取横向滚动框
        let scrollDiv = tableArea.parentNode;
        //获取序号列的宽度
        let idColWidth;
        //暂时存储
        let shortTimeSave;
        //获取冻结承载框
        let freezeColDiv;
        //当前头部部分
        let nowTitlePart;
        //内容冻结片段
        let contentFreezePart;
        //冻结框集合
        let freDivArr = [];
        //表头冻结片段
        let titleFreezePart;

        //获取冻结节点相对body的left（每次调用都会重新计算）
        for(let index in tableTdArr){
            if(!isNaN(index) && tableTdArr[index].className.indexOf('_global_displayNone') < 0){
                //获取td的属性名称
                name = tableTdArr[index].getAttribute('attrname');
                //获取每个冻结列的宽度
                if(_this.inArray(name,attrNameArr) > -1){
                    trueLeftArr[name] = _this.get_eleToFatherLeft(tableTdArr[index],scrollDiv);
                    nodeWidthArr[name] = tableTdArr[index].offsetWidth;
                }
                //获取序号宽度
                if(tableTdArr[index].getAttribute('name') == 'dataItemId' && idColWidth === undefined){
                    idColWidth = tableTdArr[index].offsetWidth;
                }
            }
        }
        //根据节点的left进行排序(从小到大)
        attrNameArr.sort(function (item1,item2) {
            return trueLeftArr[item1] - trueLeftArr[item2];
        });
        /*for(let index = 0; index < attrNameArr.length - 1; index ++){
         startName = attrNameArr[index];
         endName = attrNameArr[index + 1];
         if(trueLeftArr[startName] > trueLeftArr[endName]){
         shortTimeSave = attrNameArr[index];
         attrNameArr[index] = attrNameArr[index + 1];
         attrNameArr[index + 1] = shortTimeSave;
         }
         }*/
        //根据freezeColumnAttrNameArr和nodeWidthArr修改freezeColumnTrueLeftArr里的值
        Object.keys(trueLeftArr).forEach(function (name) {
            //初始化临时存储
            shortTimeSave = [];
            //循环属性名集合
            for(let index in attrNameArr){
                if(!isNaN(index)){
                    //当循环到指定的冻结列时跳出
                    if(attrNameArr[index] == name){
                        break;
                    }else {
                        //否则则将指定的冻结列之前的所有冻结列存储起来
                        shortTimeSave.push(attrNameArr[index]);
                    }
                }
            }
            //用于减去当前冻结列之前所有冻结列宽度和
            if(shortTimeSave.length != 0){
                shortTimeSave.forEach(function (item) {
                    //减去在当前冻结列之前的所有冻结列的宽度
                    trueLeftArr[name] -= nodeWidthArr[item];
                })
            }
            //减去序号列的宽度
            trueLeftArr[name] -= idColWidth;
        });

        //验证冻结承载框是否已经存在
        freezeColDiv = tableArea.getElementsByClassName('_qd_freColDiv');
        //若冻结承载框不存在时插入冻结承载框
        if(freezeColDiv.length == 0){
            _this.init_freezeColDiv(tableId);
            //将头部冻结框和内容冻结框存储到一个数组变量中
            if(freDivArr.length == 0){
                for(let index in freezeColDiv){
                    if(!isNaN(index)){
                        freDivArr.push(freezeColDiv[index]);
                    }
                }
            }
            //绑定滚动事件
            _this.scroll_freezeColumn(tableId,freDivArr,scrollDiv);
        }else if(isFreeze) {
            //重新冻结头部
            //获取头部区域的直接子节点
            shortTimeSave = tableArea.getElementsByClassName('_qd_tableTitleDiv')[0].children;
            for(let index in shortTimeSave){
                if(!isNaN(index) && shortTimeSave[index].tagName.toLowerCase() == 'table'){
                    nowTitlePart = shortTimeSave[index];
                }
            }
            //获取冻结后的头部片段
            titleFreezePart = _this.get_freezeTitleColPart(tableId,nowTitlePart);
            //清空头部冻结框
            freezeColDiv[0].innerHTML = '';
            //将头部冻结片段插入头部冻结框
            freezeColDiv[0].appendChild(titleFreezePart);

            //获取展示框中的所有table片段
            shortTimeSave = tableArea.getElementsByClassName('_qd_tableContentDiv')[0].getElementsByTagName('table');
            //清空内容展示区
            freezeColDiv[1].innerHTML = '';
            //循环获取展示区的冻结片段后插入冻结承载框
            for(let index in shortTimeSave){
                if(!isNaN(index)){
                    //获取冻结片段
                    contentFreezePart = _this.get_freezeContentColPart(tableId,shortTimeSave[index]);
                    //插入冻结承载框
                    freezeColDiv[1].appendChild(contentFreezePart);
                }
            }
            //将非array的冻结框集合转为数组
            if(freDivArr.length == 0){
                for(let index in freezeColDiv){
                    if(!isNaN(index)){
                        freDivArr.push(freezeColDiv[index]);
                    }
                }
            }
        }
        //处理当前冻结承载框的width
        _this.status_freezePart(tableId,scrollDiv.scrollLeft,freDivArr);
        //释放内存
        freDivArr = null;
        freezeColDiv = null;
    };

    /**
     * 方法：生成/修改头部冻结
     */
    _this.get_freezeTitleColPart = function (tableId,tablePart) {
        //获取qd-table区域
        // let tableArea = document.getElementById(tableId);
        //获取表头区域
        // let tableTitleDiv = tableArea.getElementsByClassName('_qd_tableTitleDiv');
        //获取表头冻结承载框
        // let freezeDiv = tableTitleDiv.getElementsByClassName('freColDiv')[0];
        //获取冻结列的属性名集合
        let attrNameArr = freezeColumnAttrNameArr[tableId];
        //获取td/th的真实宽度
        let trueWidth;
        //获取td/th的真实高度
        let trueHeight;
        //获取td/th的节点集合
        let nodeArr;
        //获取头标签正则表达式
        let headlabelRule;
        //存储头部table的html
        let tableHtml = freezeColTableHtml;
        //获取新的table节点
        let newTableNode;
        //获取新的htmlStr
        let newHtmlStr = '';
        //获取th/td节点头标签的正则表达式
        let trueRule;
        //获取th头标签的正则表达式
        let thRule = /<th[^>]*attrname[^>]*>/;
        //获取td头标签的正则表达式
        let tdRule = /<td[^>]*attrname[^>]*>/;
        //获取attrName
        let attrName;
        //获取table子节点集合
        let newChildNodeArr;
        //获取table的宽度
        let tableWidth = 0;


        if(tablePart.getElementsByTagName('th').length > 0){
            nodeArr = tablePart.getElementsByTagName('th');
            trueRule = thRule;
        }else if(tablePart.getElementsByTagName('td').length > 0){
            nodeArr = tablePart.getElementsByTagName('td');
            trueRule = tdRule;
        }else {
            throw new Error('get_freezeTitleColPart方法中的tablePart不符合规格');
        }
        //获取新table节点
        newTableNode = _this.domNode(tableHtml)[0];
        //便利nodeArr获取要插入的新htmlStr
        for(let nodeIndex in nodeArr){
            if(!isNaN(nodeIndex)){
                if(nodeArr[nodeIndex].className.indexOf('_qd_headColumn') > -1 && nodeArr[nodeIndex].getAttribute('name') == 'dataItemIdName'){
                    newHtmlStr = nodeArr[nodeIndex].outerHTML;
                    headlabelRule = (nodeArr[nodeIndex].tagName.toLowerCase() == 'th') ? /<th[^>]*>/ : /<td[^>]*>/;
                    newHtmlStr = newHtmlStr.replace(headlabelRule,function (labelStr) {
                        return labelStr.slice(0,-1) + ' style="width:'+ nodeArr[nodeIndex].offsetWidth +'px;height:'+ nodeArr[nodeIndex].offsetHeight +'px;">'
                    })
                }
                attrName = nodeArr[nodeIndex].getAttribute('attrname');
                if(_this.inArray(attrName,attrNameArr) > -1){
                    //需要减去border的宽度
                    trueWidth = nodeArr[nodeIndex].offsetWidth - 1;
                    trueHeight = nodeArr[nodeIndex].offsetHeight;
                    newHtmlStr += nodeArr[nodeIndex].outerHTML.replace(trueRule,function (headLabel) {
                        if(headLabel.indexOf('style=') > -1){
                            if(headLabel.indexOf('width:') > -1){
                                headLabel = headLabel.replace(/width:[0-9]+px/,'width:' + trueWidth + 'px');
                            }else if(headLabel.indexOf('height:') > -1){
                                headLabel = headLabel.replace(/height:[0-9]+px/,'height:' + trueHeight + 'px');
                            }else {
                                headLabel = headLabel.replace(/style=('|")[^'|"]*("|")/,function (str) {
                                    return str.slice(0,-1) + ';width:' + trueWidth + 'px;height:' + trueHeight + 'px;' + str.slice(-1);
                                })
                            }
                        }else {
                            headLabel = headLabel.slice(0,-1) + ' style="width:' + trueWidth + 'px;height:' + trueHeight + 'px;">';
                        }
                        return headLabel;
                    });
                }
            }
        }
        //将提取的htmlStr写入新table节点
        newTableNode.innerHTML = newHtmlStr;
        newChildNodeArr = newTableNode.getElementsByTagName('tr')[0].childNodes;
        for(let index in newChildNodeArr){
            if(!isNaN(index) && (newChildNodeArr[index].tagName.toLowerCase() == 'th' || newChildNodeArr[index].tagName.toLowerCase() == 'td')){
                tableWidth += parseInt(newChildNodeArr[index].style.width);
            }
        }
        newTableNode.style.width = tableWidth + 'px';
        //清空承载框中的内容
        // freezeDiv.innerHTML = '';
        //将新的table写点写入承载框
        // freezeDiv.appendChild(newTableNode);
        //释放内存
        // tableArea = null;
        // tableTitleDiv = null;
        // freezeDiv = null;
        //返回头部片段
        return newTableNode;
    };

    /**
     * 方法：将特定片段中的冻结列提取后生成冻结片段进行存储（用于内容片段）
     */
    _this.get_freezeContentColPart = function (tableId,tablePart) {
        //获取冻结列的属性名集合
        let attrNameArr = freezeColumnAttrNameArr[tableId];
        //存储属性名
        let attrName;
        //存储片段的htmlStr
        let htmlStr = tablePart.firstElementChild.innerHTML;
        //新的tableHtml
        let tableHtml = freezeColTableHtml;
        //头节点的正则表达式
        let headTdRule = /<td[^>]*_qd_headColumn[^>]*>((?!<\/td>).)*<\/td>/g;
        //正文节点的正则表达式
        let contentTdRule = /<td[^>]*dataValue[^>]*>((?!<\/td>).)*<\/td>/g;
        //存储levelIndex
        let levelIndex;
        //获取新的table节点对象
        let newTableNode;
        //要存储冻结片段的复合对象
        let newFreezePartObj = {};
        //获取片段中一行节点集合
        let tdArr = tablePart.getElementsByTagName('tr')[0].getElementsByTagName('td');
        //获取冻结列的宽高集合
        let widthHeightArr = {};
        //用于存储节点的宽高
        let newData;
        //获取子节点集合
        let newChildNodeArr;
        //获取table宽度
        let tableWidth = 0;
        //获取序号节点的宽高信息
        let nodeInfo = {};
        //获取tr集合
        let trArr;

        //初始化冻结列片段数组
        if(freezeColPart[tableId] === undefined){
            freezeColPart[tableId] = [];
        }
        //获取table片段的levelIndex;
        levelIndex = tablePart.getAttribute('levelindex');

        //获取宽高集合
        for(let tdIndex in tdArr){
            if(!isNaN(tdIndex)){
                attrName = tdArr[tdIndex].getAttribute('attrname');
                if(tdArr[tdIndex].getAttribute('name') == 'dataItemSelect'){
                    nodeInfo.width = tdArr[tdIndex].offsetWidth;
                    nodeInfo.height = tdArr[tdIndex].offsetHeight;
                }
                if(_this.inArray(attrName,attrNameArr) > -1){
                    newData = {};
                    //因为需要减去border的宽度;
                    newData.width = tdArr[tdIndex].offsetWidth - 1;
                    newData.height = tdArr[tdIndex].offsetHeight - 1;
                    widthHeightArr[attrName] = newData;
                }
            }
        }

        //将当前片段中所有非冻结跟非序号的节点删除
        htmlStr = htmlStr.replace(headTdRule,function (headTdStr) {
            if(headTdStr.indexOf('dataItemId') < 0){
                return '';
            }else {
                headTdStr = headTdStr.replace(/<td[^>]*>/,function (labelStr) {
                    return labelStr.slice(0,-1) + ' style="width:'+ nodeInfo.width +'px;height:'+ nodeInfo.height +'px;">';
                });
                return headTdStr;
            }
        }).replace(contentTdRule,function (contentTdStr) {
            attrName = contentTdStr.match(/attrname=('|")[^'"]*('|")/)[0].slice(10,-1);
            if(_this.inArray(attrName,attrNameArr) > -1){
                contentTdStr = contentTdStr.replace(/<td[^>]*>/,function (headLabelStr) {
                    if(headLabelStr.indexOf('style=') > -1){
                        headLabelStr = headLabelStr.replace(/style=('|")[^'"]*('|")/,function (styleStr) {
                            if(styleStr.indexOf('width:') > -1 && styleStr.indexOf('height:') > -1){
                                styleStr = styleStr.replace(/width:\d+(px)?/,'width:' + widthHeightArr[attrName].width + 'px')
                                    .replace(/height:\d+(px)?/,'height:'+ widthHeightArr[attrName].height +'px');
                            }else if(styleStr.indexOf('height:') > -1){
                                styleStr = styleStr.replace(/height:\d+(px)?/,'width:' + widthHeightArr[attrName].width + 'px;height:'+ widthHeightArr[attrName].height +'px');
                            }else if(styleStr.indexOf('width:') > -1){
                                styleStr = styleStr.replace(/width:\d+(px)?/,'width:' + widthHeightArr[attrName].width + 'px;height:'+ widthHeightArr[attrName].height +'px');
                            }else {
                                styleStr = styleStr.slice(0,-1) + ';width:' + widthHeightArr[attrName].width +'px;height:'+ widthHeightArr[attrName].height +'px;' + styleStr.slice(-1);
                            }
                            return styleStr;
                        })
                    }else {
                        headLabelStr = headLabelStr.replace('>',' style="width:'+ widthHeightArr[attrName].width +'px;height:'+ widthHeightArr[attrName].height +'px;">');
                    }
                    return headLabelStr;
                });
                return contentTdStr;
            }else {
                return '';
            }
        });

        //将生成的内容插入table节点并保存进全局变量
        newTableNode = _this.domNode(tableHtml)[0];
        newTableNode.getAttribute('levelindex',levelIndex);
        newTableNode.innerHTML = htmlStr;
        trArr = newTableNode.getElementsByTagName('tr');
        newChildNodeArr = trArr[trArr.length - 1].childNodes;
        for(let index in newChildNodeArr){
            if(!isNaN(index) && (newChildNodeArr[index].tagName.toLowerCase() == 'th' || newChildNodeArr[index].tagName.toLowerCase() == 'td')){
                newChildNodeArr[index].style.height = parseInt(newChildNodeArr[index].style.height) - 1 + 'px';
                tableWidth += parseInt(newChildNodeArr[index].style.width);
            }
        }
        trArr[trArr.length - 1].style.height = parseInt(trArr[trArr.length - 1].style.height) - 1 + 'px';
        newTableNode.style.width = tableWidth + 'px';
        newFreezePartObj.freezePart = newTableNode;
        newFreezePartObj.isReFreeze = false;
        freezeColPart[tableId][levelIndex] = newFreezePartObj;
        newFreezePartObj = null;
        /*//当对应位置的冻结片段的levelindex与位置不相等，则生成新table插入改位置(无法存储)
        if(freezeColPart[tableId][levelIndex].getAttribute('levelindex') != levelIndex){
            newTableNode = _this.domNode(tableHtml)[0];
            newTableNode.getAttribute('levelindex',levelIndex);
            newTableNode.innerHTML = htmlStr;
            freezeColPart[tableId].splice(levelIndex,0,newTableNode);
            newTableNode = null;
        }else {
            //当对应位置的冻结片段的levelindex与位置相等，则替换该片段的内容
            freezeColPart[tableId][levelIndex].firstElementChild.innerHTML = htmlStr;
        }*/
        /*if(tablePart.getElementsByTagName('th').length != 0){
            nodeArr = tablePart.getElementsByTagName('th');
        }else if(tablePart.getElementsByTagName('td').length != 0) {
            nodeArr = tablePart.getElementsByTagName('td');
        }
        console.log('我改变冻结状态了',attrNameArr,trueLeftArr);
        for(let index in nodeArr){
            if(!isNaN(index)){
                attrName = nodeArr[index].getAttribute('attrname');
                if(_this.inArray(attrName,attrNameArr) > -1 ){//&& scrollDiv.scrollLeft > trueLeftArr[attrName]
                    nodeArr[index].classList.add('_qd_freezeColumn');
                    nodeArr[index].style.left = (scrollDiv.scrollLeft > trueLeftArr[attrName]) ? scrollDiv.scrollLeft - trueLeftArr[attrName] + 'px' : 0;
                }
            }
        }*/
        attrNameArr = null;
        tablePart = null;
        return newTableNode;
    };

    /**
     * 方法：更改冻结列承载框宽度来实现列隐藏效果（取消/设置冻结列 + 滚动时使用）
     */
    _this.status_freezePart = function (tableId,scrollLeft,freezeColDiv,nowShowFreezeColName) {
        //获取滚动框节点对象
        let scrollDiv = document.getElementById(tableId).parentNode;
        //获取冻结列的名称集合
        let freezeColNameArr = freezeColumnAttrNameArr[tableId];
        //获取冻结列的距左距离（会减去前面的冻结列）
        let freezeColLeftArr = freezeColumnTrueLeftArr[tableId];
        //获取第一行节点集合
        let nodeArr;
        //获取承载框的实际宽度
        let trueWidth = 0;
        //获取属性名称
        let attrName;
        //暂时存储
        let shortTimeSave;

        //获取当前要冻结列的属性名称
        nowShowFreezeColName = nowShowFreezeColName || undefined;
        //获取冻结承载框中表格的一行中的节点集合
        if(freezeColDiv instanceof Array){
            if(freezeColDiv[0].getElementsByTagName('th').length > 0){
                nodeArr = freezeColDiv[0].getElementsByTagName('tr')[0].getElementsByTagName('th');
            }else if(freezeColDiv[0].getElementsByTagName('td').length > 0){
                nodeArr = freezeColDiv[0].getElementsByTagName('tr')[0].getElementsByTagName('td');
            }else {
                throw new Error('status_freezePart方法的freezeColDiv不符合规格');
            }
        }else {
            if(freezeColDiv.getElementsByTagName('th').length > 0){
                nodeArr = freezeColDiv.getElementsByTagName('tr')[0].getElementsByTagName('th');
            }else if(freezeColDiv.getElementsByTagName('td').length > 0){
                nodeArr = freezeColDiv.getElementsByTagName('tr')[0].getElementsByTagName('td');
            }else {
                throw new Error('status_freezePart方法的freezeColDiv不符合规格');
            }
        }

        if(nowShowFreezeColName !== undefined){
            for(let nodeIndex in nodeArr){
                if(!isNaN(nodeIndex)){
                    trueWidth += parseInt(nodeArr[nodeIndex].style.width);
                    if(nodeArr[nodeIndex].getAttribute('attrname') == nowShowFreezeColName){
                        shortTimeSave = nodeArr[nodeIndex];
                        break;
                    }
                }
            }
            //计算冻结承载框的真实宽度
            // trueWidth = _this.get_eleToFatherLeft(shortTimeSave,scrollDiv) - freezeColLeftArr[nowShowFreezeColName] + parseInt(shortTimeSave.style.width);
        }else if(nowShowFreezeColName == null){
            trueWidth = 0;
        }else {
            //通过设定承载框的宽度来达到隐藏冻结列效果
            for(let index in freezeColNameArr){
                //获取冻结列的属性名称
                attrName = freezeColNameArr[index];
                //从左到右比对冻结列，直到滚动距离未能大于触发距离时触发下列代码
                if(!(scrollLeft > freezeColLeftArr[attrName])){
                    //获取当前冻结列的一项
                    for(let nodeIndex in nodeArr){
                        if(!isNaN(nodeIndex)){
                            trueWidth += parseInt(nodeArr[nodeIndex].style.width);
                            if(nodeArr[nodeIndex].getAttribute('attrname') == attrName){
                                shortTimeSave = nodeArr[nodeIndex];
                                break;
                            }
                        }
                    }
                    //获取包括当前冻结列 + 之前的所有冻结列的宽度和
                    // trueWidth = _this.get_eleToFatherLeft(shortTimeSave,scrollDiv) - freezeColLeftArr[attrName] + parseInt(shortTimeSave.style.width);
                    break;
                }
            }
        }
        //修改承载框的宽度
        if(freezeColDiv instanceof Array){
            freezeColDiv.forEach(function (divObj) {
                divObj.style.width = trueWidth + 'px';
            })
        }else {
            freezeColDiv.style.width = trueWidth + 'px';
        }
    };


    /*========================================  * td的Input框模块 *  ==========================================*/

    //定义td中input的失焦事件
    function tdInputBlur(inputNode) {
        //将input的内容记录
        let inputValue = inputNode.value;
        //获取td节点
        let tdNode = inputNode.parentNode;
        //证明点击对象是否在批量修改框内
        let batchEditObj = _this.parents(tdNode,'div._qd_batchEditContentArea');
        //若在批量修改框内
        if(batchEditObj.length > 0){
            //移除input节点
            tdNode.removeChild(inputNode);
            //将input的value写入td节点中
            tdNode.innerText = inputValue;
        }else {
            //获取td的属性名
            let attrName = tdNode.getAttribute('attrname');
            //获取tr节点
            let trNode = tdNode.parentNode;
            //获取序号
            let trIndex = parseInt(trNode.getElementsByClassName('_qd_headColumn')[1].textContent) - differentValue;
            //获取tableId
            let tableId = _this.parents(tdNode,'div[name="tableFather"]')[0].id;
            //修改数据源中的数据
            dataSourceArr[tableId][trIndex][attrName] = inputValue;
            //将td中的input节点删除
            tdNode.removeChild(inputNode);
            //将input的值写入td节点中
            tdNode.innerText = inputValue;
        }
    }

    /*========================================  * td编辑框弹出框模块 *  ==========================================*/
    /**
     * 方法：插入编辑框
     */
    _this.append_editBox = function () {
        let editBoxHtml = '<div id="_qd_tableTdEdit" class="_qd_editBoxBg _global_displayNone"><div class="_qd_editBoxDiv"><div class="_qd_editBoxUpPart"><div class="_qd_editPart">' +
            '<textarea class="_qd_editBoxTextArea" name="" id="" cols="30" rows="10"></textarea></div><div class="_qd_editListPart"></div></div><div class="_qd_editBoxDownPart">' +
            '<button class="_qd_editBoxBtn" style="background-color: #00aaff" btntype="true">确认</button><button class="_qd_editBoxBtn" style="background-color: #ff0000;" btntype="false">取消</button></div></div></div>';
        let body = document.body;
        let childrenNodes = body.children;
        let editBox = _this.domNode(editBoxHtml)[0];

        for(let index = childrenNodes.length - 1; index > -1 ; index --){
            if(childrenNodes[index].tagName.toLowerCase() != 'script'){
                if(index == childrenNodes.length - 1){
                    body.appendChild(editBox);
                }else {
                    body.insertBefore(editBox,childrenNodes[index + 1]);
                }
                break;
            }
        }
        _this.event_editBoxListMouseDown(editBox);
        _this.event_editBoxButton(editBox);
        _this.event_editBoxDrag(editBox);
        body = null;
        editBox = null;
        childrenNodes = null;
    };

    /**
     * 方法：初始化编辑框
     */
    _this.initEditBox = function(editNode,listData){
        //获取编辑框区域
        let edit = document.getElementById('_qd_tableTdEdit');
        //获取编辑部分
        let editPart = edit.getElementsByClassName('_qd_editPart')[0];
        //获取列表部分
        let listPart = edit.getElementsByClassName('_qd_editListPart')[0];
        //获取textarea
        let textArea = editPart.getElementsByTagName('textarea')[0];
        //获取当前的属性名
        let nowAttrName;
        //获取列表的htmlStr
        let listStr = '';
        //是否多选
        let moreSelect;
        //获取当前选中td数据转换的数组
        let nowTdDataArr;
        //获取当前的li集合
        let liArr;
        //获取当前li中的p节点
        let pNode;
        //获取当前li中的CB节点
        let cbNode;
        //获取当前全选复选框
        let allSelCB;
        //获取选中数量
        let selNum = 0;

        //清空编辑框里的内容
        textArea.value = '';
        //清空列表部分中的内容
        listPart.innerHTML = '';

        //初始化编辑部分
        editPart.style.width = '100%';

        //获取当前的属性名
        nowAttrName = editNode.getAttribute('attrname');

        //将表格中的数据写入编辑框
        textArea.value = editNode.textContent;
        //将表格数据转换为数组
        if(editNode.textContent.indexOf(',') > -1){
            nowTdDataArr = editNode.textContent.split(',');
        }else {
            if(nowTdDataArr === undefined){
                nowTdDataArr = [];
            }
            nowTdDataArr.push(editNode.textContent);
        }

        if(listData instanceof Array){
            //遍历关联数据，若有关联数据，则将数据以列表的形式写入列表区域
            for(let index in listData){
                if(!isNaN(index) && listData[index].attrName == nowAttrName){
                    moreSelect = listData[index].isMoreSelect;
                    listStr = _this.get_editBoxList(listData[index].dataSource,listData[index].isMoreSelect);
                    break;
                }
            }
        }else if(listData !== undefined){
            if(listData.attrName == nowAttrName){
                moreSelect = listData.isMoreSelect;
                listStr = _this.get_editBoxList(listData.dataSource,listData.isMoreSelect);
            }
        }

        if(listStr != ''){
            editPart.style.width = '349px';
            listPart.style.width = '150px';
            listPart.innerHTML = listStr;
        }

        //若list是多选，则勾选上已有项
        if(listStr != '' && moreSelect){
            liArr = listPart.getElementsByTagName('li');
            nowTdDataArr.forEach(function (item) {
                for(let index in liArr){
                    if(!isNaN(index)){
                        cbNode = liArr[index].getElementsByTagName('input')[0];
                        if(!cbNode.checked){
                            pNode = liArr[index].getElementsByTagName('p')[0];
                            if(pNode.textContent == item){
                                cbNode.checked = true;
                                selNum += 1;
                                break;
                            }
                        }
                    }
                }
            });
            if(selNum == liArr.length){
                allSelCB = listPart.getElementsByClassName('_qd_allSelectDivSize')[0].getElementsByTagName('input')[0];
                allSelCB.checked = true;
                allSelCB = null;
            }
        }

        _this.display_editBox(true);
    };

    /**
     * 方法：用于生成列表htmlStr
     */
    _this.get_editBoxList = function(linkData,isMoreSelect) {
        //存储列表标签Str
        let aloneSelectListHtml = '<ul class="_qd_ulSize"></ul>';
        let moreSelectListHTML = '<div class="_qd_moreSelectUlDivSize"><ul class="_qd_moreSelectUlSize"></ul><div class="_qd_allSelectDivSize"><input class="_qd_moreSelectAllCBSize" type="checkbox"><p class="_global_clickThrough">全选</p></div></div>';
        //存储列表子项Str
        let aloneSelectLiHTML = '<li class="_qd_liSize" showtip="false"></li>';
        let moreSelectLiHTML = '<li class="_qd_moreSelectLiSize"><input class="_qd_moreSelectCBSize" type="checkbox"><p class="_global_clickThrough" showtip="false"></p></li>';
        //返回的htmlStr
        let returnHtmlStr = '';
        //暂时存储
        let shortTimeSave;

        shortTimeSave = '';
        if(isMoreSelect){
            //多选
            linkData.forEach(function (item) {
                shortTimeSave += moreSelectLiHTML.replace(/<\/p>/,item + '</p>');
            });
            returnHtmlStr = moreSelectListHTML.replace(/<\/ul>/,shortTimeSave + '</ul>');
        }else {
            //单选
            linkData.forEach(function (item) {
                shortTimeSave += aloneSelectLiHTML.replace(/<\/li>/,item + '</li>');
            });
            returnHtmlStr = aloneSelectListHtml.replace(/<\/ul>/,shortTimeSave + '</ul>');
        }
        //返回列表htmlStr
        return returnHtmlStr;
    };

    /**
     * 方法：用于绑定编辑框的点击事件
     */
    _this.event_editBoxListMouseDown = function(editBox) {
        //获取列表框
        let listPart = editBox.getElementsByClassName('_qd_editListPart')[0];
        //当前点击对象
        let actObj;
        //当前列表子项节点
        let nowLiObj;

        listPart.addEventListener('mousedown', function (event) {
            //当列表内容为空时，不执行后续代码
            if (listPart.innerHTML == '') {
                return;
            }
            actObj = event.target;
            if (actObj && event.button == 0) {
                //当点击的对象不存在于全选框内且不是全选框时执行
                if (_this.parents(actObj, 'div._qd_allSelectDivSize').length == 0 && actObj.className.indexOf('_qd_allSelectDivSize') < 0) {
                    nowLiObj = _this.parents(actObj, 'li');
                    if (nowLiObj.length > 0) {
                        if (nowLiObj[0].getElementsByTagName('input').length > 0) {
                            _this.event_editBoxMoreSelect(nowLiObj[0],actObj);
                        } else {
                            _this.event_editBoxAloneSelect(nowLiObj[0]);
                        }
                    }
                    //当点击对象是全选框或者存在于全选框内时执行
                } else if (_this.parents(actObj, 'div._qd_allSelectDivSize').length > 0 || actObj.className.indexOf('_qd_allSelectDivSize') > -1) {
                    nowLiObj = (_this.parents(actObj, 'div._qd_allSelectDivSize').length > 0) ? _this.parents(actObj, 'div._qd_allSelectDivSize')[0] : actObj;
                    _this.event_editBoxMoreSelect(nowLiObj,actObj);
                }
            }
        });
    };

    /**
     * 方法：编辑框列表单选事件
     */
    _this.event_editBoxAloneSelect = function(liObj) {
        //获取列表的承载框
        let listDiv = _this.parents(liObj,'div._qd_editListPart')[0];
        //获取编辑的承载框
        let editDiv = listDiv.previousElementSibling;
        //获取编辑节点
        let textArea = editDiv.getElementsByTagName('textarea')[0];
        //获取编辑节点的值
        // let value = textArea.value;
        //获取选中子项的值
        let selectValue = liObj.textContent;
        //获取列表子项集合
        // let liArr;
        //存储正则表达式
        // let selRule;

        //将选中项替换掉编辑框内容
        textArea.value = selectValue;

        /*
         //已经被选中
        if(liObj.className.indexOf('_qd_liSelect') > -1){
            selRule = new RegExp(selectValue + '[,]?','g');
            //去除编辑框中被选中项的内容
            textArea.value = value.replace(selRule,'').replace(/(^,|,,|,$)/,function (str) {
                return (str == ',,') ? ',' : '';
            });
            //移除选中样式
            liObj.classList.remove('_qd_liSelect');
        }else {
            //获取li集合
            liArr = liObj.parentNode.getElementsByTagName('li');
            //将之前被选中的li节点取消选中
            for(let index in liArr){
                if(!isNaN(index) && liArr[index].className.indexOf('_qd_liSelect') > -1){
                    selRule = new RegExp(liArr[index].textContent + '[,]?','g');
                    //去除选中样式
                    liArr[index].classList.remove('_qd_liSelect');
                    //去除被选中的
                    value = value.replace(selRule,'').replace(/(^,|,{2,}|,$)/g,function (str) {
                        return (str.length > 1) ? ',' : '';
                    });
                    break;
                }
            }
            liObj.classList.add('_qd_liSelect');
            value += (value == '') ? liObj.textContent : ',' + liObj.textContent;
            textArea.value = value;
        }*/
    };

    /**
     * 方法：编辑框列表多选事件
     * 注意事项：当点击复选框时，复选框的选中状态的更变是在mouseDown事件之后触发
     */
    _this.event_editBoxMoreSelect = function(liObj,nowClickNode) {
        //获取列表的承载框
        let listDiv = _this.parents(liObj,'div._qd_editListPart')[0];
        //获取编辑的承载框
        let editDiv = listDiv.previousElementSibling;
        //获取编辑节点
        let textArea = editDiv.getElementsByTagName('textarea')[0];
        //获取编辑节点的值
        let value = textArea.value;
        //获取选中子项的值
        let selectValue;
        //获取列表子项集合
        let liArr;
        //获取当前的复选框
        let nowActCB = liObj.getElementsByTagName('input')[0];
        //获取当前li的内容
        let nowPContent;
        //获取全选的复选框
        let allSelCB;
        //获取列表子项复选框
        let liSelCB;
        //判定是否全选
        let isAllSel = true;
        //临时数组
        let shortTimeArr;
        //临时数量
        let shortTimeNum = 0;


        if(liObj.tagName.toLowerCase() == 'div'){
            allSelCB = nowActCB;
            //保证点击对象不为复选框的情况下执行代码
            if(!(nowClickNode.tagName.toLowerCase() == 'input' && nowClickNode.getAttribute('type') == 'checkbox')){
                allSelCB.checked = !allSelCB.checked;
            }
            //当前节点是全选
            liArr = liObj.previousElementSibling.getElementsByTagName('li');
            for(let index in liArr){
                if(!isNaN(index)){
                    liSelCB = liArr[index].getElementsByTagName('input')[0];
                    nowPContent = liArr[index].getElementsByTagName('p')[0].textContent;
                    //当前点击对象不是复选框且全选复选框为选中 || 当前点击对象为复选框且点击时复习框为不选中状态
                    if((allSelCB.checked && nowClickNode.tagName.toLowerCase() != 'input') || (nowClickNode.tagName.toLowerCase() == 'input' && !nowClickNode.checked)){
                        if(!liSelCB.checked){
                            value += (value == '') ? nowPContent : ',' + nowPContent;
                        }
                    }else {
                        if(index == 0){
                            shortTimeArr = value.split(',');
                        }
                        shortTimeArr.splice(_this.inArray(nowPContent,shortTimeArr),1);
                        if(index == liArr.length - 1){
                            value = shortTimeArr.join(',');
                        }
                    }
                    // 当前点击对象为复选框
                    if(nowClickNode.tagName.toLowerCase() == 'input'){
                        if(nowClickNode.checked){
                            liSelCB.checked = false;
                        }else {
                            liSelCB.checked = true;
                        }
                    }else {
                        liSelCB.checked = allSelCB.checked;
                    }
                }
            }
            textArea.value = value.replace(/(^,|,{2,}|,$)/g,function (str) {
                return (str.length > 1) ? ',' : '';
            })
        }else {
            //当前节点不是全选
            allSelCB = liObj.parentNode.nextElementSibling.getElementsByTagName('input')[0];
            //获取li集合
            liArr = liObj.parentNode.getElementsByTagName('li');
            //获取选中项的内容
            selectValue = liObj.getElementsByTagName('p')[0].textContent;
            //修改当前复选框的选中状态，保证点击对象不是复选框的情况执行下面代码
            if(!(nowClickNode.tagName.toLowerCase() == 'input' && nowClickNode.getAttribute('type') == 'checkbox')){
                nowActCB.checked = !nowActCB.checked;
            }
            //当前点击对象不是复选框且复选框为选中 || 当前点击对象为复选框且点击时为不选中
            if((nowActCB.checked && nowClickNode.tagName.toLowerCase() != 'input') || (nowClickNode.tagName.toLowerCase() == 'input' && !nowClickNode.checked)){
                //当点击对象不为复选框时执行
                if(nowClickNode.tagName.toLowerCase() != 'input' &&  nowClickNode.getAttribute('type') != 'checkbox'){
                    for (let index in liArr){
                        if(!isNaN(index) && !liArr[index].getElementsByTagName('input')[0].checked){
                            isAllSel = false;
                            break;
                        }
                    }
                }else {
                    //当点击对象为复选框时执行
                    for (let index in liArr){
                        if(!isNaN(index) && !liArr[index].getElementsByTagName('input')[0].checked){
                            shortTimeNum += 1;
                            //当未选中的复选框的个数大于1时
                            if(shortTimeNum > 1){
                                isAllSel = false;
                                break;
                            }
                        }
                    }
                }
                allSelCB.checked = isAllSel;
                value += (value == '') ? selectValue : ',' + selectValue;
            }else {
                //当点击对象不是复选框时
                if(nowClickNode.tagName.toLowerCase() != 'input'){
                    allSelCB.checked = nowActCB.checked;
                }else {
                    allSelCB.checked = false;
                }
                shortTimeArr = value.split(',');
                shortTimeArr.splice(_this.inArray(selectValue,shortTimeArr),1);
                value = shortTimeArr.join(',');
            }
            textArea.value = value.replace(/(^,|,{2,}|,$)/g,function (str) {
                return (str.length > 1) ? ',' : '';
            });
        }
    };

    /**
     * 方法：编辑框按钮绑定事件
     */
    _this.event_editBoxButton = function(editBox) {
        editBox = editBox || document.getElementById('_qd_tableTdEdit');
        let upPart = editBox.getElementsByClassName('_qd_editBoxUpPart')[0];
        let downPart = editBox.getElementsByClassName('_qd_editBoxDownPart')[0];
        let textArea = upPart.firstElementChild.getElementsByTagName('textarea')[0];
        let ev;
        let actNode;
        if(downPart.onmousedown == null){
            downPart.onmousedown = function(event){
                ev = event || window.event;
                actNode = ev.target;
                if(actNode && ev.button == 0 && actNode.tagName.toLowerCase() == 'button'){
                    if(actNode.getAttribute('btntype') == 'true'){
                        _this.event_editBoxBtnTrue(textArea);
                    }
                    _this.display_editBox(false);
                }
            }
        }
    };

    /**
     * 方法：编辑框确定按钮事件
     */
    _this.event_editBoxBtnTrue = function(textArea) {
        //获取当前编辑框里的内容
        let value = textArea.value;
        //获取tableId
        let tableId;
        //获取数据源
        let dataSource;
        //获取选中的行节点对象
        let selTrNode;
        //获取td集合
        let tdArr;
        //获取属性名称
        let attrName;
        //选取行下标
        let trIndex;
        //判定是否为批量修改编辑框
        let batchEdit = _this.parents(nowEditTdNode,'div._qd_batchEditDiv');

        //获取选中节点
        nowEditTdNode.textContent = value;
        //当前编辑节点在真正的表格内
        if(batchEdit.length == 0){
            tableId = _this.parents(nowEditTdNode,'div._qd_tableDivSize')[0].getAttribute('id');
            dataSource = dataSourceArr[tableId];
            selTrNode = nowEditTdNode.parentNode;
            tdArr = selTrNode.children;
            attrName = nowEditTdNode.getAttribute('attrname');
            for(let index in tdArr){
                if(!isNaN(index) && tdArr[index].tagName.toLowerCase() == 'td' && tdArr[index].getAttribute('name') == 'dataItemId'){
                    //获取行序号
                    trIndex = parseInt(tdArr[index].textContent);
                    break;
                }
            }
            dataSource[trIndex - 1][attrName] = value;
        }
        dataSource = null;
        selTrNode = null;
        tdArr = null;
    };

    /**
     * 方法：编辑框展示函数
     */
    _this.display_editBox = function(isShow) {
        let editBox = document.getElementById('_qd_tableTdEdit');
        if(isShow){
            if(editBox.className.indexOf('_global_displayNone') > -1){
                editBox.classList.remove('_global_displayNone');
            }
        }else {
            if(editBox.className.indexOf('_global_displayNone') < 0){
                editBox.classList.add('_global_displayNone');
            }
        }
        //重置拖拽线的位置
        _this.reset_dragLinePlace();
    };

    /**
     * 方法：编辑器与列表模块横向拖动事件
     */
    _this.event_editBoxDrag = function(editBox) {
        //获取编辑框的上半部
        let upPart = editBox.getElementsByClassName('_qd_editBoxUpPart')[0];
        //获取上半部分中的编辑框
        let editPart = upPart.getElementsByClassName('_qd_editPart')[0];
        //获取上半部分中的列表框
        let listPart = upPart.getElementsByClassName('_qd_editListPart')[0];
        //获取兼容事件参数
        let ev;
        //获取距离差
        let relLength;
        //获取编辑框的真实左距离
        let editTrueLeft;
        //获取编辑框的真实上距离
        let editTrueTop;
        //获取竖线
        let VLineDiv = document.getElementById('vLineDiv');
        //获取外联样式表
        let linkStyle = (window.getComputedStyle) ? window.getComputedStyle(editBox.firstElementChild,null) : editBox.firstElementChild.currentStyle;

        //获取编辑框距屏幕的左距离
        editTrueLeft = (document.body.clientWidth - parseInt(linkStyle.width))/2;
        //获取编辑框距屏幕的上距离
        editTrueTop = (document.body.clientHeight - parseInt(linkStyle.height))/2;

        upPart.addEventListener('mousemove', function (event) {
            //当列表不存在时不触发后续代码
            if (listPart.innerHTML == '') {
                return;
            }
            ev = event || window.event;
            relLength = ev.pageX - editTrueLeft;
            //当鼠标移动到编辑框与列表分界线的左右5px的范围内且
            if ((relLength > editPart.offsetWidth - 5 && relLength < editPart.offsetWidth + 5)
                && (parseInt(VLineDiv.style.left) < editTrueLeft + editPart.offsetWidth - 5 || parseInt(VLineDiv.style.left) > editTrueLeft + editPart.offsetWidth + 5
                || parseInt(VLineDiv.style.top) != editTrueTop)) {
                VLineDiv.style.left = editTrueLeft + editPart.offsetWidth - 5 + 'px';
                VLineDiv.style.top = editTrueTop + 'px';
                VLineDiv.style.height = editPart.parentNode.clientHeight + 'px';
                leftNode = editPart;
                rightNode = listPart;
            }
        });
    };

    /*========================================  * 内容提示框模块 *  ==========================================*/
    /**
     * 方法：插入内容浮框
     */
    _this.append_contentTip = function () {
        let textTipHtml = globalTipHTML;
        let body = document.body;
        let childNodes = body.children;

        for(let index = childNodes.length - 1; index > -1 ;){
            if(childNodes[index].tagName.toLowerCase() == 'script'){
                index -- ;
            }else {
                if(index == childNodes.length - 1){
                    body.appendChild(_this.domNode(textTipHtml)[0]);
                }else {
                    body.insertBefore(_this.domNode(textTipHtml)[0],childNodes[index + 1]);
                }
                break;
            }
        }
    };
    /**
     * 方法：计算浮框的长宽
     */
    _this.count_tipWidthHeight = function (event,globalTip,text) {
        //存储浏览器可见宽度
        let bodyWidth = document.body.clientWidth;
        //获取宽度
        let width;
        //获取面积
        let area;
        //当文本为空的时候，不执行下面的代码
        if(text == ''){
            return;
        }
        //展示提示框
        if(globalTip.className.indexOf('_global_displayNone') > -1){
            globalTip.classList.remove('_global_displayNone');
        }
        //消除标签中style中的width(以防较短的内容占用过长的提示宽度)
        if(globalTip.style.width != ''){
            globalTip.style.width = '';
        }
        //若不消除left,tip框无法被内容撑到真实宽度，将导致长内容的tip框不会被限制宽度
        if(globalTip.style.left != ''){
            globalTip.style.left = '';
        }
        //将文本写入div
        globalTip.innerText = text;
        //当宽度大于一半浏览器可见宽度时执行
        if(globalTip.offsetWidth > bodyWidth/2){
            //计算面积
            area = globalTip.offsetWidth * globalTip.offsetHeight;
            //计算宽度
            width = (parseInt(Math.sqrt(area)) < document.body.clientWidth/2) ? parseInt(Math.sqrt(area)) + 1 : document.body.clientWidth/2;
            //定义提示框的宽度
            globalTip.style.width = width + 'px';
        }
        //改变提示框的方位
        _this.event_globalTipMove(event,globalTip);
    };

    /**
     * 方法：全局提示框的移动事件
     */
    _this.event_globalTipShowChange = function (event,needTipNode,globalTip) {
        //当移进的节点还未显示提示
        if(needTipNode.getAttribute('showtip')){
            if(needTipNode.getAttribute('showtip') == 'false'){
                //停止显示提示的计时
                clearTimeout(globalTipTime);
                //将上个显示提示的节点的属性更改
                if(haveTipNode !== undefined){
                    haveTipNode.setAttribute('showtip','false');
                }
                //若全局提示显示则隐藏
                if(globalTip.className.indexOf('_global_displayNone') < 0){
                    globalTip.classList.add('_global_displayNone');
                }
                //开始显示提示的计时
                globalTipTime = setTimeout(function () {
                    //存储新展示的节点
                    haveTipNode = needTipNode;
                    //将节点中的展示属性更改
                    haveTipNode.setAttribute('showtip', 'true');
                    //重新计算全局提示框的宽高和写入
                    _this.count_tipWidthHeight(event,globalTip,haveTipNode.textContent);
                }, 1000);
            }
        }else {
            //停止显示提示的计时
            clearTimeout(globalTipTime);
            //将上个显示提示的节点的属性更改
            if(haveTipNode !== undefined){
                haveTipNode.setAttribute('showtip','false');
            }
            //若全局提示显示则隐藏
            if(globalTip.className.indexOf('_global_displayNone') < 0){
                globalTip.classList.add('_global_displayNone');
            }
        }
    };
    /**
     * 方法：计算全局提示框的方位并移动
     */
    _this.event_globalTipMove = function (event,globalTip) {
        //若提示框隐藏时，不执行下面的代码
        if(globalTip.className.indexOf('_global_displayNone') > -1){
            return;
        }
        //获取body节点
        let body = document.body;
        //获取鼠标的y坐标
        let mouseTip = event.pageY;
        //获取鼠标的x坐标
        let mouseLeft = event.pageX;
        // console.log(mouseTip,mouseLeft);
        //若提示框的超出屏幕右边框，则左显示
        if(parseInt(mouseLeft) + globalTip.offsetWidth > body.scrollLeft + body.clientWidth){
            globalTip.style.left = mouseLeft - globalTip.offsetWidth + 'px';
        }else {
            globalTip.style.left = mouseLeft + 10 + 'px';
        }
        //若提示框的超出屏幕下边框，则上显示
        if(parseInt(mouseTip) + globalTip.offsetHeight > body.scrollTop + body.clientHeight){
            globalTip.style.top = mouseTip - globalTip.offsetHeight + 'px';
        }else {
            globalTip.style.top = mouseTip + 10 + 'px';
        }
    };

    /*========================================  * 外部接口模块 *  ==========================================*/

    /**
     * 接口：调用写入数据源方法
     */
    _this.set_data = function (tableId,newData,dataObj) {
        if(document.getElementById(tableId) == null){
            throw new Error('未能获取到tableId对应的节点');
        }
        if(typeof tableId != 'string' && tableId !== undefined){
            throw new Error('tableId参数类型错误！');
        }
        if(!(typeof newData == 'object' && newData instanceof Array)){
            throw new Error('newData参数类型错误！');
        }
        if (document.getElementById(tableId).tagName != 'TABLE') {
            throw new Error('tableId对应的节点不是table标签');
        }
        if(typeof dataObj != 'object'){
            throw new Error('接口setDataSource的dataObj参数应为obj');
        }
        _this.set_dataSource(tableId,newData,dataObj)
    };

    /**
     * 接口：重写数据源
     */
    _this.reset_data = function (tableId,newData,dataObj) {
        let shortTimeNodeObj = document.getElementById(tableId);
        if(shortTimeNodeObj == null){
            throw new Error('未能获取到tableId对应的节点');
        }
        if(shortTimeNodeObj.tagName.toLowerCase() == 'div' && shortTimeNodeObj.getAttribute('name') == 'tableFather'){
            isReSetData = true;
            //是重写数据
            _this.set_dataSource(tableId,newData,dataObj);
        }else {
            //不是重写数据
            _this.set_data(tableId,newData,dataObj);
        }
    };

    //写入关联数据_外部接口
    /*_this.write_linkData = function (tableId,attrName,dataSource,isMoreSelect) {
        isMoreSelect = isMoreSelect || false;
        //存储未确认作用对象集合
        let actObjArr;
        //存储未确认作用对象
        let actObj;
        //存储已经确认的table对象
        let qdTableArr = [];
        //存储关联数据的数据对象
        let newDataObj;
        //存储qdTable的id
        let trueTableId;
        //存储table的内部html;
        let tableInnerHTML;


        if(!(dataSource instanceof Array)){
            throw new Error('传入writeLinkData方法的dataSource参数类型需为Array');
        }
        if(tableId === null){
            tableId = undefined;
        }
        if(tableId === undefined){
            actObjArr = document.getElementsByName('qd-table');
            for (let key in actObjArr){
                if(!isNaN(key) && actObjArr[key].tagName.toLowerCase() == 'table'){
                    qdTableArr.push(actObjArr[key]);
                }
            }
        }else if(tableId instanceof Array){
            tableId.forEach(function (id) {
                actObj = document.getElementById(id);
                if(actObj.tagName.toLowerCase() == 'table' && actObj.getAttribute('name') == 'qd-table'){
                    qdTableArr.push(actObj);
                }else {
                    console.log('id为：'+ id +'的元素不符合规定table元素的要求');
                }
            })
        }else if(typeof tableId == 'string'){
            actObj = document.getElementById(tableId);
            if(actObj.tagName.toLowerCase() == 'table' && actObj.getAttribute('name') == 'qd-table'){
                qdTableArr.push(actObj);
            }else {
                console.log('id为：'+ tableId +'的元素不符合规定table元素的要求');
            }
        }
        qdTableArr.forEach(function (tableObj) {
            trueTableId = tableObj.getAttribute('id');
            //第三版
            tableInnerHTML = tableObj.firstElementChild.innerHTML;
            tableInnerHTML = _this.write_linkDataToHtml(trueTableId,tableInnerHTML,attrName,dataSource,isMoreSelect);
            tableObj.removeChild(tableObj.firstElementChild);
            tableObj.innerHTML = tableInnerHTML;
        });
    };*/

    /**
     * 接口：修改table宽度
     */
    _this.set_tableWidth = function (tableId,widthValue,isSplitEqually) {
        isSplitEqually = isSplitEqually || false;
        let tableObj = document.getElementById(tableId);
        if(tableObj.tagName.toLowerCase() != 'table' || tableObj.getAttribute('name') != 'qd-table'){
            throw new Error('传入setTableWidth方法的id对应的元素不符合qd-table的规定');
        }
        //第二版
        _this.set_tableWidthHTML(tableObj,widthValue,isSplitEqually);
    };

    /**
     * 接口：修改功能框标签
     */
    _this.set_specialBtn = function (tableId,rewriteDataObj) {
        let tableObj = document.getElementById(tableId);
        if(tableObj.tagName.toLowerCase() != 'table'){
            throw new Error('buttonRender传入的tableId对应的节点不符合规格');
        }else if(tableObj.getAttribute('name') != 'qd-table'){
            throw new Error('buttonRender传入的tableId对应的节点不符合规格');
        }
        _this.rewrite_funBtnArea(tableId,rewriteDataObj);
    };

    /**
     * 接口：清除写入tableData的定时器
     */
    _this.clear_mainTime = function () {
        clearInterval(sendOverTime);
        clearInterval(saveTableDataTime);
    };

    /**
     * 接口：清除所有数据
     */
    _this.clean_allData = function () {
        //清除数据源集合
        dataSourceArr = null;
        //构造函数里的this指针
        _this = null;
        //存储td的mouseUp事件
        tdMouseUpEvent = null;
        //处理完成的htmlStr数组
        finalHtmlStrArr = null;
        //存储头部table对象
        titleTableObj = null;
        //存储最终生成table数组
        finalTableArr = null;
        //存储复选框选中的行的序号
        selectTrIndexArr = null;
        //存储要所有table片段里需要删除的行的集合
        deleteItem = null;
        //存储webWorker对象
        worker = null;
    };

    /**
     * 接口：设定delete按钮的回调函数
     */
    _this.set_delBtnCallBack = function (callback) {
        deleteMethodCallBack = callback;
    };

    /**
     * 接口：设定add按钮的回调函数
     */
    _this.set_addBtnCallBack = function (callback) {
        addMethodCallBack = callback;
    };

    /**
     * 接口：强制终止worker的外部链接
     */
    _this.stop_worker = function () {
        //终止线程
        worker.terminate();
    };
    /**
     * 接口：功能按钮区的添加功能
     */
    _this.add_newTableTr = function (tableId,addNum) {
        //获取最外层父框
        let tableFatherDiv = document.getElementById(tableId);
        //获取展示区域
        let tableContentDiv = tableFatherDiv.getElementsByClassName('_qd_tableContentDiv')[0];
        //过滤一遍addNum
        if(addNum !== undefined){
            addNum = (addNum > 0) ? parseInt(addNum) : 1;
        }
        if(isSendOver){
            _this.add_newDataItem(tableContentDiv,tableId);
        }else {
            _this.show_loadingPage(true,'正在写入余下的数据，请稍后');
            sendOverTime = setInterval(function () {
                if(isSendOver){
                    _this.show_loadingPage(false);
                    _this.add_newDataItem(tableContentDiv,tableId,addNum);
                    clearInterval(sendOverTime);
                }
            },500)
        }
    };
    /**
     * 接口：功能按钮区的删除功能
     */
    _this.delete_tableTr = function (tableId) {
        let tableFatherDiv = document.getElementById(tableId);
        let tableContentDiv = tableFatherDiv.getElementsByClassName('_qd_tableContentDiv')[0];
        if(isSendOver){
            _this.remove_dataItem(tableContentDiv,tableId);
        }else {
            _this.show_loadingPage(true,'正在写入余下的数据，请稍后');
            sendOverTime = setInterval(function () {
                if(isSendOver){
                    _this.show_loadingPage(false);
                    _this.remove_dataItem(tableContentDiv,tableId);
                    clearInterval(sendOverTime);
                }
            },500)
        }
    };
    /**
     * 接口：功能按钮区的批量修改功能
     */
    _this.edit_tableTr = function (tableId) {
        _this.create_batchEditContent(tableId);
    };



    /*========================================  * 公共方法调用区域 *  ==========================================*/
    /**
     * 方法：调用全局点击事件
     */
    _this.mouseDown_global();
    /**
     * 方法：调用全局双击事件
     */
    _this.dblclick_global();
    /**
     * 方法：调用全局移动事件
     */
    _this.mouseMove_global();
    //添加页面关闭缓存和定时器清除功能
    window.addEventListener('beforeunload',function () {
        console.log('清除了数据');
        //终止线程
        worker.terminate();
        //线程事件移除
        worker.onmessage = null;
        _this.clear_mainTime();
        _this.clean_allData();
    });

    return {
        //根据数据生成表格
        setData:_this.set_data,
        //重写数据生成新表格
        resetData:_this.reset_data,
        //设置删除的回调函数
        setDelBtnCallBack:_this.set_delBtnCallBack,
        //设置添加的回调函数
        setAddBtnCallBack:_this.set_addBtnCallBack,
        //终止线程
        stopWorker:_this.stop_worker,
        //添加新行
        addNewTableTr:_this.add_newTableTr,
        //删除行
        delTableTr:_this.delete_tableTr,
        //批量修改
        batchEdit:_this.edit_tableTr,
        //提示框
        loadingShow: _this.show_loadingPage
    };
};