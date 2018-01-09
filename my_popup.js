
(function (win, dom) {
	function MyPopup (selId, o) {

		this.bodyOffsetH = dom.documentElement.offsetHeight || dom.body.offsetHeight;	// 内容高度+padding+border
		this.bodyOffsetW = dom.documentElement.offsetWidth || dom.body.offsetWidth;		// 内容宽度+padding+border
		this.bodyClientH = dom.documentElement.clientHeight || dom.body.clientHeight;	// 可视区域高度
		this.bodyClientW = dom.documentElement.clientWidth || dom.body.clientWidth;		// 可视区域宽度
		this.bodyScrollH = dom.documentElement.scrollTop || dom.body.scrollTop;			// 滚动高度
		this.bodyScrollW = dom.documentElement.scrollLeft || dom.body.scrollLeft;		// 滚动宽度

		this.oParam = this.setParam(o ? o.param || null : null);

		this.oPopup = dom.getElementById(selId);
		this.oPopupBg = this.createPopupBg();
		this.oContentBox = dom.querySelectorAll("#" + selId + " .popup-content");
		this.aShowBtn = this.getSwitchBtn(selId, '.popup-show');
		this.aCloseBtn = this.getSwitchBtn(selId, '.popup-close');

		this.showFn = o ? o.showFn || null : null;
		this.closeFn = o ? o.closeFn || null : null;

		this.init();
	}

	MyPopup.prototype.init = function () {
		// 执行初始化样式函数
		this.initStyle();

		// 执行初始化事件
		this.initEvent();
	}
	// 初始化样式函数
	MyPopup.prototype.initStyle = function () {
		var _this = this;

		// 设置是否可以滚动，配合show出现时设置popup-content的marginTop
		this.oParam.isfixed ? void(0) : addClass(this.oPopup, "nofixed");

		// 初始化弹窗显隐方式
		this.oParam.type != 'none' ? addClass(this.oPopup, 'close-' + this.oParam.type) : void(0);

		// 重置弹窗背景颜色
		this.oPopupBg.style.background = this.oParam.bgcolor;

		// 设置透明度
		this.oPopupBg.style.opacity = this.oParam.opacity;
		this.oPopupBg.style.filter = 'alpha(opacity=' +  this.oParam.opacity * 100  + ');';

		// 重置过度所需要的时间
		this.oParam.time != 200 ? this.oPopup.style.transitionDuration = this.oParam.time + "ms" : void(0);

		// 默认显示第一个content
		this.content(0);
	}

	MyPopup.prototype.initEvent = function () {
		var _this = this;
		
		// 绑定显示弹窗的函数
		for ( var i = 0; i < this.aShowBtn.length; i++ ) {
			var item = this.aShowBtn[i];
			addEvent(item, 'click', function () {
				_this.show(_this.showFn);
			})
		}

		// 隐藏弹窗的函数
		for ( var i = 0 ; i < this.aCloseBtn.length; i++ ) {
			var item = this.aCloseBtn[i];
			addEvent(item, 'click', function () {
				_this.close(_this.closeFn);
			})
		}

		// 点击遮罩时隐藏弹窗
		this.oPopupBg.onclick = function(e) {
			if ( _this.oParam.bgclose ) {
				_this.close(_this.closeFn);
			}
		}
	}

	/**
	 * 作用：获取有关该弹窗的打开关闭按钮
	 * 参数：str1 -> 该弹窗的id；str2 -> 打开关闭的选择器
	 */
	MyPopup.prototype.getSwitchBtn = function (str1, str2) {
		var obj = dom.querySelectorAll(str2);
		var arr = [];
		for( var i = 0; i < obj.length; i++) {
			var linkedId = getDataset(obj[i]).linkedId;
			if ( linkedId == str1 ) {
				arr.push(obj[i]);
			}
		}
		return arr;
	}

	/**
	 * 作用：重置默认参数
	 */
	MyPopup.prototype.setParam = function (oParam) {

		oParam = oParam ? oParam : {};

		// 弹窗是否固定居中（默认true可以） 值：true、false
		oParam.isfixed = oParam.isfixed == false ? false : true;

		// 可否通过点击背景关闭弹窗 （默认true可以） 值：true、false
		oParam.bgclose = oParam.bgclose == false ? false : true;

		// 背景透明度（默认0）
		oParam.opacity = oParam.opacity >= 0 ? oParam.opacity : 0;

		// 弹窗出现的方式（默认none无动画） 值：none、opacity、top、right、bottom、left
		oParam.type = inArray(['opacity', 'top', 'bottom', 'left', 'right'], oParam.type) ? oParam.type : 'none';

		// 弹窗出现动画的时长（默认200ms）
		oParam.time = oParam.type == 'none' ? 0 : oParam.time >= 0 ? oParam.time : 200;

		// 背景颜色（默认transparent）
		oParam.bgcolor = oParam.bgcolor || 'transparent';

		return oParam;
	}

	/**
	 * 作用：创建背景
	 */
	MyPopup.prototype.createPopupBg = function () {
		var oPopupBg = document.createElement('div');
		oPopupBg.className = 'my-popup-bg';
		this.oPopup.appendChild(oPopupBg);
		return oPopupBg;
	}

	/**
	 * 作用：想要让弹窗出来就执行这个函数勒
	 * showFn -> 显示弹窗之前执行的函数；oPos -> 在非固定时候弹窗出现的定位（top, left)，默认为居中
	 */
	MyPopup.prototype.show = function (showFn, oPos) {
		var _this = this;

		showFn ? showFn() : this.showFn ? this.showFn() : void (0);

		// 将oPopup高度设置为body的高度，并将popup-content放在可视区域中间
		this.bodyScrollH = dom.documentElement.scrollTop || dom.body.scrollTop;	// 滚动高度

		if ( !this.oParam.isfixed ) {

			for( var i = 0; i < this.oContentBox.length; i++ ) {
				var item = this.oContentBox[i];
				var iHeight = this.getOffsetSize(item).height;
				var iWidth = this.getOffsetSize(item).width;

				var iTop = this.bodyScrollH + (this.bodyClientH - iHeight) / 2;
				var iLeft = 0;

				// 如果content高度过大，使得top值小于了滚动高度加20的话，就是top为滚动高度加20
				if ( iTop + 20 <= this.bodyScrollH ) {
					iTop = this.bodyScrollH + 20;
				} else if ( oPos ) {
					iTop = oPos.top;
					iLeft = oPos.left;
				}
				item.style.verticalAlign = 'top';
				item.style.marginTop = iTop + 'px';
				item.style.marginLeft = iLeft + 'px';
			}
			this.oPopup.style.textAlign = oPos ? 'left' : 'center';
			this.oPopup.style.minHeight = this.bodyClientH + 'px';

		} else {
			for ( var i = 0 ; i < this.oContentBox.length; i++ ) {
				var item = this.oContentBox[i];
				
				item.style.verticalAlign = 'middle';
				item.style.marginTop = 0;
				item.style.marginLeft = 0;
			}
			this.oPopup.style.textAlign = 'center';
		}

		setTimeout(function () {
			_this.oPopup.style.display = 'block';
			setTimeout(function() {
				if ( _this.oParam.type != 'none' ) {
					removeClass(_this.oPopup, "close-" + _this.oParam.type);
					addClass(_this.oPopup, "show-" + _this.oParam.type);
				}
			}, 20);
		}, 5);
	}

	/**
	 * 作用：关闭弹窗
	 */
	MyPopup.prototype.close = function (closeFn) {
		var _this = this;

		closeFn ? closeFn() : this.closeFn ? this.closeFn() : void(0);

		if ( _this.oParam.type != 'none' ) {
			removeClass(_this.oPopup, "show-" + _this.oParam.type);
			addClass(_this.oPopup, "close-" + _this.oParam.type);
		}
		setTimeout(function() {
			_this.oPopup.style.display = 'none';
		}, _this.oParam.time);
	}

	/**
	 * 作用：切换content内容
	 */
	MyPopup.prototype.content = function (iNum) {
		if ( this.oContentBox.length <= 1 ) {
			return false;
		}
		for ( var i = 0; i < this.oContentBox.length; i++ ) {
			if ( i == iNum ) {
				this.oContentBox[i].style.display = 'inline-block';
			} else {
				this.oContentBox[i].style.display = 'none';
			}
		}
	}

	// 获取offset尺寸，特殊情况（这儿oPopup才是display:none;）
	MyPopup.prototype.getOffsetSize = function (obj) {
	    var oldStyle = {
	        position: getStyle(this.oPopup, "position"),
	        visibility: getStyle(this.oPopup, "visibility"),
	        display: getStyle(this.oPopup, 'display')
	    }
	    var newStyle = {
	        position: "absolute",
	        visibility: "hidden",
	        display: "inline-block"
	    }

	    // 将oPopup显示出来，其中的popup-content才有机会量宽高
	    setStyle(this.oPopup, newStyle);

		var sDisplay = getStyle(obj, "display");
	    var res = {}

	    if ( sDisplay != "none" ) {
	        res.width = obj.offsetWidth;
	        res.height = obj.offsetHeight;
	    } else {
	        var objOldStyle = {
	            position: getStyle(obj, "position"),
	            visibility: getStyle(obj, "visibility"),
	            display: sDisplay
	        }
	        // 将popup-content显示出来量宽高
	        setStyle(obj, newStyle);
	        res.width = obj.offsetWidth;
	        res.height = obj.offsetHeight;
	        // 还原
	        setStyle(obj, objOldStyle);
	    }
	    // 还原
	    setStyle(this.oPopup, oldStyle);
	    return res;
	}

	/**
	 * 作用：获取定位居中需要设置的top与left
	 */
	MyPopup.prototype.getCenterPos = function (obj) {
		var iBoxSize = this.getOffsetSize(this.oPopup);

		var iContentSize = this.getOffsetSize(obj);

		var oPos = {
			top: (iBoxSize.height - iContentSize.height) / 2,
			left: (iBoxSize.width - iContentSize.width) / 2
		}

		return oPos;
	}

	/****************************************************************************************/
	/**
	 * 兼容事件代理
	 */
	 function addEvent (obj, type, callback) {
	 	if ( obj.addEventListener ) {
	 		obj.addEventListener(type, callback, false);
	 	} else if ( obj.attachEvent ) {
	 		obj.attachEvent('on' + type, callback);
	 	}
	 }

	/**
	 * 添加类、删除类、切换类、判断是否有类
	 */
	function addClass (obj, classname) {
	    var str = obj.className;
	    if ( str == '' ) {
	        obj.className = classname;
	    } else if ( !hasClass(obj, classname) ) {
	        obj.className = str + ' ' + classname;
	    }
	}
	function removeClass (obj, classname) {
		var str = obj.className;
		var bHasClass = true;
		if(str == classname) {
			obj.className = '';
		} else if(str.indexOf(classname + ' ') != -1) {
			str = str.replace(classname + ' ', '');
		} else if(str.indexOf(' ' + classname) != -1) {
			str = str.replace(' ' + classname, '');
		} else {
	        bHasClass = false;
	    }
		obj.className = str;

		if ( bHasClass ) {
	        removeClass(obj, classname);
	    }
	}
	function toggleClass (obj, classname) {
		var str = obj.className;
		if(hasClass(obj, classname)) {
			removeClass(obj, classname);
		} else {
			addClass(obj, classname);
		}
	}
	function hasClass(obj, classname) {
	    var str = obj.className;
	    if ( str == classname || str.indexOf(classname + " ") != -1 || str.indexOf(" " + classname) != -1 ) {
	        return true;
	    } else {
	        return false;
	    }
	}


	/****************************************************************************************/
	/**
	 * 获取样式
	 */
	function getStyle (obj, name) {
	    if(win.getComputedStyle) {
	        return getComputedStyle(obj, null)[name];
	    } else {
	        return obj.currentStyle[name];
	    }
	}

	/**
	 * 设置样式
	 */
	function setStyle (obj, oStyle) {
        for(var i in oStyle) {
            obj.style[i] = oStyle[i];
        }
    }

	/**
	 * 作用：获取dom节点以data-开头的属性数组
	 * 注意：会将以data-开头的属性先全转为小写，然后以驼峰形式替换-中划线
	 */
	function getDataset (obj) {
	    var dataset = {};
	    if ( obj.dataset ) {
	        dataset = obj.dataset;
	    } else {
	        var aAttr = obj.attributes;

	        for ( var i = 0; i < aAttr.length; i++ ) {
	            var sName = aAttr[i].nodeName.toLowerCase();
	            var sValue = aAttr[i].nodeValue;

	            var reg1 = /^data-[\w-]+$/;
	            var reg2 = /^data-/;
	            var reg3 = /-[a-zA-Z]/g;

	            if ( reg1.test(sName) ) {
	                // 去除开头的data-
	                sName = sName.replace(reg2, '');
	                // 将键名改为驼峰
	                if ( reg3.test(sName) ) {
	                    sName = sName.replace(reg3, function (word) {
	                        var sB = word.split('')[1].toUpperCase();
	                        return sB;
	                    })
	                }
	                dataset[sName] = sValue;
	            }
	        }
	    }
	    return dataset;
	}

	/**
	 * 作用：判断数是否存在于数组中
	 */
	function inArray (arr, val) {
		for ( var i = 0; i < arr.length; i++ ) {
			if ( arr[i] == val ) {
				return true;
			}
		}
		return false;
	}

	if ( typeof define === "function" && define.amd ) {
		define([], function () {
			return MyPopup;
		});
	}
	win.MyPopup = MyPopup;
})(window, document);

	