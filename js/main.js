(function () {
	/**
	 *$formAddTask     添加任务的表单
	 *$taskList        任务列表
	 *taskLis          用来存储数据
	 *$taskDetail 	   任务详细
	 *$mask 		   阴影遮罩
	 *$msg 			   头部提醒信息
	 *$msg-cont 	   头部提醒信息内容
	 *$msg-cont		   头部提醒信息确认按钮
	 *$alert		   提醒铃声   
	 **/
	var $formAddTask=$('.add-task form'),
		$taskList=$('#task-list'),
		taskList=[],
		$taskDetail=$('.task-detail'),
		$mask=$('#mask'),
		$msg=$('.msg'),
		$msgCont=$('.msg-cont'),
		$msgbt=$('.msg-bt'),
		$alert=$('.alert');
	//初始化
	init();
	//点击提交监听
	$formAddTask.on('submit',submitListen);
	//添加删除监听
	$taskList.on('click','.delete',deleteListen);
	//给.task-item和$mask添加点击监听
	$taskList.on('click','.task-item',taskItemListen);
	$mask.on('click',detailHide);
	//checkbox的点击监听
	$taskList.on('click','input[type="checkbox"].complete',completeListen);

	/**
	 *点击提交事件
	 **/
	function submitListen(e){
		e.preventDefault();
		var $input=$(this).find('input');
		if (!$input.val()) {
			return;
		}else{
			var newTask={};
			newTask.content=$input.val();
			if (addTask(newTask)) {
				$input.val('');
			}
		}
	}
	/**
	 *向taskList中添加新的数据
	 **/
	function addTask(newTask){
		taskList.unshift(newTask);
		refreshList();
		return true;
	}
	/**
	 *点击删除事件
	 **/
	function deleteListen(e){
		e.stopPropagation();
		var index=$(this).parents('.task-item').data('index');	
		confirmPopup(index);
	}
	/**
	 *删除并重新渲染任务列表
	 *@param{number}index 传入想要删除taskList中元素索引
	 **/
	function deleteTask(index){
		if (!taskList[index]||index===undefined) {
			return;
		}else{		
			taskList.splice(index,1);
			refreshList();
		}
	}
	/**
	 *当点击删除按钮时,执行此函数,添加自定义alert弹窗
	 *@param{number}index  传入想要删除的元素索引
	 **/
	function confirmPopup(index){
		var $body=$('body'),
			$confirm=$('<div class="confirm">'+
							'<div class="confirm-tit">确定删除？</div>'+
							'<div class="confirm-cont">'+
								'<button class="define">确定</button>'+
								'<button class="cancel">取消</button>'+
							'</div>'+
						'</div>'),
			$confirmMask=$('<div class="confirmMask"></div>');
		$body.append($confirm).append($confirmMask);
		//让弹窗居中
		center();
		$(window).resize(center);
		/*让弹窗居中函数*/
		function center(){
			var x=($(window).width()-$confirm.width())/2;
			var y=($(window).height()-$confirm.height())/2-20;
			$confirm.css({
				left: x+'px',
				top: y+'px'
			});
		}
		//点击遮罩事件
		$confirmMask.click(function(){
			$confirm.hide();
			$confirmMask.hide();
		});
		//点击确定事件
		$('.define').click(function(){
			deleteTask(index);
			$confirm.hide();
			$confirmMask.hide();
		});
		//点击取消事件
		$('.cancel').click(function(){
			$confirm.hide();
			$confirmMask.hide();
		});
	}

	 /*点击详细列表出现*/
	 function taskItemListen(){
	 	var index=$(this).data('index');
	 	detailShow(index);
	 }
	 /*详细列表显示*/
	 function detailShow(index){
	 	renderDetailItem(index);
	 	$taskDetail.slideDown();
	 	$mask.show();
	 }
	 /*详细列表隐藏*/
	 function detailHide(){
	 	$taskDetail.slideUp();
	 	$mask.hide();
	 }
	 /**
	  *更新TaskList的数据,data与taskList[index]数据合并
	  *@param{number}index 被合并的数据的索引
	  *@parma{obj}data 要合并的对象 
	  **/
	 function updateTask(index,data){
	 	taskList[index]=$.extend(true, taskList[index], data);	 	
	 	refreshList();
	 }
	 /*任务列表中checkbox点击事件,checkbox选中之后,更新任务列表*/
	 function completeListen(e){
	 	e.stopPropagation();
	 	var $this=$(this);
	 	var index=$this.parents('.task-item').data('index');
	 	var isComplete=$(this).prop('checked');
	 	updateTask(index,{complete:isComplete});
	 }
	 /*任务提醒,求出当前时间与任务时间,当任务提醒完成之后,remind为true*/
	 function taskRemind(){
	 	var timer=setInterval(function(){
	 		for(var i=0;i<taskList.length;i++){
	 			if (taskList[i].date&&!taskList[i].remind) {
	 				var currentDate=new Date().getTime();
	 				var setDate=new Date(taskList[i].date).getTime();
	 				if (setDate-currentDate<=0) {
	 					showMsg(taskList[i].content+taskList[i].date);
	 					updateTask(i,{remind:true});
	 				}
	 			}
	 		}
	 	},300);	
	 }
	 /*在头部显示提醒信息*/
	 function showMsg(msg){
	 	$msg.show();
	 	$msgCont.html('[提醒] '+msg);
	 	$alert.get(0).play();
	 }
	 $msgbt.click(function(){
	 	$msg.hide();
	 });
	 /*渲染指定index的模块*/
	 function renderDetailItem(index){
	 	var data=taskList[index];
	 	var itemHtml='<form class="detail-item">'+
						'<div class="detail-tit">'+
							'<span class="detailContent">'+data.content+'</span>'+
							'<input class="dataText" type="text" value="'+(data.content||'')+'">'+
						'</div>'+
						'<div class="detail-desc">'+
							'<textarea class="dataDesc">'+(data.desc||'')+'</textarea>'+
						'</div>'+
						'<div class="detail-remind">'+
							'<label>提醒时间</label>'+
							'<input class="remindDate" type="text" value="'+(data.date||'')+'">'+
							'<button type="submit">提交</button>'+
						'</div>'+
					 '</form>';
		$taskDetail.html('');
		$taskDetail.html(itemHtml);
		//添加日历组件
		$('.detail-remind .remindDate').datetimepicker();

		/*详细列表提交事件*/
		$('.detail-item').on('submit',function(e){
			e.preventDefault();
			var data={};
			data.content=$(this).find('.dataText').val();
			data.desc=$(this).find('.dataDesc').val();
			data.date=$(this).find('.remindDate').val();
			data.remind=false;
			updateTask(index,data);
			detailHide();
		});
		$('.detailContent').click(function(){
			$(this).hide()
				   .siblings('.dataText').show();			
		});
	 }
	/**
	 *刷新数据并渲染任务列表
	 **/
	function refreshList(){
		store.set('taskList',taskList);
		renderList();
	}
	/**
	 *渲染列表,将已完成的任务和未完成的任务分开
	 *已完成的任务被排在任务列表的尾部
	 **/
	function renderList(){
		var taskListHtml='';
		var completeList='';
		var completeArr=[];
		//未完成任务
		for(var i=0;i<taskList.length;i++){
			if (!taskList[i].complete) {
				taskListHtml+=renderListItem(taskList[i],i);
			}else{
				completeArr[i]=taskList[i];
			}
		}
		$taskList.html(taskListHtml);
		//已完成任务
		for(var j=0;j<completeArr.length+i;j++){
			if (completeArr[j]) {
				var $completeItem=$(renderListItem(completeArr[j],j));
				$completeItem.addClass('completed');
				$taskList.append($completeItem);
			}
		}
	}
	/**
	 *更新item的html
	 **/
	function renderListItem(data,index){
		if (!data||index==='') {
			return ;
		}
		var itemHtml='';
		return itemHtml='<div class="task-item" data-index='+index+'>'+
							'<span><input class="complete" type="checkbox"'+(data.complete?'checked':'')+'>'+
							'<label class="item-content">'+data.content+'</label></span>'+
							'<span class="fr">'+
								'<span class="action delete">删除 </span>'+
								'<span class="action detail">详细</span>'+
							'</span>'+
						'</div>';
	}
	/**
	 *读取localstorage并渲染列表
	 **/
	function init(){
		taskList=store.get('taskList')||[];
		renderList();
		taskRemind();
	}
})();