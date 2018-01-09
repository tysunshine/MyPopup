(function (win, doc) {
	/**
	 * msg -> 显示的消息内容
	 * o.bgcolor -> 遮罩层背景颜色，默认transparent透明
	 * o.time -> 动画时间，默认200ms
	 * o.msgAlign -> 文本对齐方式，默认居中对齐，'l'左对齐，'c'居中对齐，'r'右对齐
	 * o.aBtnTxt -> 按钮文本数组，通过该数组知道要创建多少个按钮
	 * o.btnAlign -> 按钮在按钮组中的对齐方式，默认居中对齐，'l'左对齐，'c'居中对齐，'r'右对齐
	 * 注：第一个按钮会给它添加yes-btn类名；按钮如果不自己绑定事件的话，默认是点击就调用close事件
	 */
	var oMyAlert = {
		
		sSelId: 'myAlert',				// 弹窗的id

		oMyPopup: null,					// 弹窗

		iBtnNum: 0,						// 按钮的个数

		msg: '',						// 信息
		oParam: {},						// 配置参数

		init: function (msg, o) {

			// 没有弹窗了，才能创建弹窗
			if ( this.oMyPopup ) {
				return false;
			}

			this.msg = msg || '';
			o ? this.oParam = o : void(0);

			this.setParam();

			this.createBox();
			this.createContent();
			this.createMsg();
			this.createBtnBox();
			doc.body.appendChild(this.odMyAlert);

			this.oMyPopup = new MyPopup(this.sSelId, {
				param: {
					isfixed: true,						// 弹窗是否固定居中（默认true可以） 值：true、false
					type: 'opacity',					// 弹窗出现的方式（默认opactiy淡入淡出） 值：opacity、top、right、bottom、left
					bgclose: this.oParam.bgclose,		// 可否通过点击背景关闭弹窗 （默认true可以） 值：true、false
					time: this.oParam.time,				// 弹窗出现动画的时长（默认200ms）
					bgcolor: this.oParam.bgcolor,		// 背景颜色（默认transparent）
					opacity: this.oParam.opacity 		// 背景透明度（默认0）
				}
			})

			this.initState();
			this.initEvent();
		},

		initState: function () {
			var _this = this;

			this.oParam.showFn ? this.oParam.showFn() : void(0);
			this.oMyPopup.show();

			if ( this.iBtnNum == 0 ) {
				setTimeout(function () {
					_this.close();
				}, 1500);
			}
		},

		initEvent: function () {
			for ( var i = 1; i <= this.iBtnNum; i++ ) {
				var sBtn = 'btn' + i;
				this.btnClick(sBtn);
			}
		},

		// 设置参数状态
		setParam: function () {

			// 是否可以点击背景关闭对话框（默认false不能）
			this.oParam.bgclose == true ? true : false;

			// 背景颜色
			this.oParam.bgcolor = this.oParam.bgcolor ||'transparent';

			// 背景透明度
			this.oParam.opacity >= 0 && this.oParam.opacity <= 1 ? this.oParam.opacity : 0;

			// 动画时间
			this.oParam.time = this.oParam.time >= 0 ? this.oParam.time : 200;

			// 初始化文本对齐方式
			this.oParam.msgAlign = inArray(['l', 'c', 'r'], this.oParam.msgAlign) ? this.oParam.msgAlign : 'c';

			// 初始化按钮对齐方式
			this.oParam.btnAlign = inArray(['l', 'c', 'r'], this.oParam.btnAlign) ? this.oParam.btnAlign : 'c';

			// 初始化按钮文本数组
			!this.oParam.aBtnTxt || !(this.oParam.aBtnTxt instanceof Array) ? this.oParam.aBtnTxt = [] : void(0);
		},

		createBox: function () {
			// 创建盒子弹窗盒子
			this.odMyAlert = document.createElement('div');
			this.odMyAlert.className = 'my-popup my-alert';
			this.odMyAlert.id = this.sSelId;
		},

		createContent: function () {
			// 创建content
			this.odContent = document.createElement('div');
			this.odContent.className = 'popup-content';
			this.odMyAlert.appendChild(this.odContent);
		},

		createMsg: function () {
			// 创建消息
			this.odMsg = document.createElement('p');
			this.odMsg.className = 'msg ' + this.oParam.msgAlign;
			this.odMsg.innerHTML = this.msg;
			this.odContent.appendChild(this.odMsg);
		},

		createBtnBox: function () {
			// 创建按钮组

			this.iBtnNum = this.oParam.aBtnTxt.length;
			if ( this.oParam.aBtnTxt.length == 0 ) {
				return false;
			}

			this.odBtnBox = document.createElement('div');
			this.odBtnBox.className = 'btn-box ' + this.oParam.btnAlign;

			for ( var i = 0; i < this.oParam.aBtnTxt.length; i++ ) {
				var sBtn = 'btn' + (i + 1);
				this[sBtn] = document.createElement('button');
				if ( i == 0 ) {
					this[sBtn].className = 'yes-btn';
				}
				this[sBtn].innerHTML = this.oParam.aBtnTxt[i];

				this.odBtnBox.appendChild(this[sBtn]);
			}

			this.odContent.appendChild(this.odBtnBox);
		},

		// 点击事件
		btnClick: function (sBtn) {
			var _this = this;
			this[sBtn].onclick = function () {
				_this.oParam[sBtn] ? _this.oParam[sBtn]() : _this.close();
			}
		},

		// 改变msg
		changeMsg: function (sMsg) {
			this.odMsg.innerHTML = sMsg;
		},

		// 关闭弹窗
		close: function () {
			var _this = this;
			this.oMyPopup.close(function () {
				setTimeout(function () {
					doc.body.removeChild(_this.odMyAlert);
					_this.oMyPopup = null;
					_this.msg = '';
					_this.oParam = {};
				}, _this.iTime + 100);
			});
		}
	}


	// 添加类名
	function addClass (obj, classname) {
	    var str = obj.className;
	    if ( str == '' ) {
	        obj.className = classname;
	    } else if ( !hasClass(obj, classname) ) {
	        obj.className = str + ' ' + classname;
	    }
	}
	// 删除类名
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
	// 判断是否有类名
	function hasClass (obj, classname) {
		var str = obj.className;
	    if ( str == classname || str.indexOf(classname + " ") != -1 || str.indexOf(" " + classname) != -1 ) {
	        return true;
	    } else {
	        return false;
	    }
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

	win.oMyAlert = {
		show: function (msg, o) {
			oMyAlert.init(msg, o);
		},
		changeMsg: function (sMsg) {
			oMyAlert.changeMsg(sMsg);
		},
		addClass: function (classname) {
			addClass(oMyAlert.odContent, classname);
		},
		removeClass: function (classname) {
			removeClass(oMyAlert.odContent, classname);
		},
		close: function () {
			oMyAlert.close();
		}
	};

})(window, document);

	