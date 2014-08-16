angular.module('starter.controllers', [])

.controller('ChannelCtrl', function($scope, $rootScope, $rootElement, $window, $state, $stateParams, ChannelDao, Friends, Cache, Sign, NAVI ) {

  ChannelDao.getAllCount().then( function ( result ){
    $rootScope.totalUnreadCount = result.total_count;
  });

  $scope.channelArray = [];

  ChannelDao.list( $scope ).then(function(channels) {
    $scope.channelArray = [];
    $scope.channelArray = channels;
  });

  $scope.gotoChat = function( channelId ) {

    ChannelDao.get( channelId ).then(function(data) {
      $stateParams.channelId = channelId;
      $stateParams.channelUsers = data.channel_users;
      $stateParams.channelName = data.channel_name;

      NAVI.gotoChat( $scope, channelId, $stateParams );
    });
  };
})
.controller('FriendsCtrl', function($scope, $rootScope, $state, $stateParams, $ionicModal, $ionicScrollDelegate, Friends, Manager, NAVI, ChannelDao, Sign) {

  /**
   * @ngdoc function
   * @name listFriend
   * @module starter.controllers
   * @kind function
   *
   * @description Retrieve friends in database
   */
  $scope.listFriend = function(){
    Friends.list(function(friends){
      if( friends !== undefined ){
        $scope.friends = [];
        $scope.friends = friends;
        $scope.friendCount = $scope.friends.length;
      }
    });
  };

  /**
   * @ngdoc function
   * @name syncFriends
   * @module starter.controllers
   * @kind function
   *
   * @description Sync friends with server
   */
  $scope.syncFriends = function(){
    Friends.refresh(function(result){
      $rootScope.syncFlag = false;
      $scope.listFriend();
    });
  };

  $scope.friends = [];
  $scope.friendCount = 0;
  $scope.searchKey = "";

  // Init Manager
  if( $rootScope.syncFlag ) {
    $scope.syncFriends();
  } else {
    $scope.listFriend();
  }

  Manager.init();

  /**
   * @ngdoc function
   * @name postFriends
   * @module starter.controllers
   * @kind function
   *
   * @description Apply friends display.
   * @param {array} filtered friends by searchKey;
   */
  $scope.postFriends = function(friends){
    if( friends !== undefined ){
      $scope.friends = [];
      $scope.friends = friends;
      $scope.friendCount = friends.length;
    }
  };

  /**
   * @ngdoc function
   * @name resetFriends
   * @module starter.controllers
   * @kind function
   *
   * @description Reset friends list
   */
  $scope.resetFriends = function(){
    Friends.list(function(friends){
      if( friends !== undefined ){
        $scope.friends = [];
        $scope.friends = friends;
        $scope.friendCount = friends.length;
      }
    });
  };

  /**
   * @ngdoc function
   * @name gotoAccount
   * @module starter.controllers
   * @kind function
   *
   * @description Navigate to Account Menu.
   */
  $scope.gotoAccount = function(){
    $state.go( 'tab.account' );
  };

  /**
   * @ngdoc function
   * @name gotoChat
   * @module starter.controllers
   * @kind function
   *
   * @description Navigate to Chat screen.
   * @param {string} Selected friend
   */
  $scope.gotoChat = function( friendIds ) {
    $stateParams.friendIds = friendIds;
    var jsonObject = {};
    jsonObject.U = [friendIds,Sign.getUser().userId];
    var channelId = ChannelDao.generateId( jsonObject );
    NAVI.gotoChat( $scope, channelId, $stateParams );
  };

  /**
   * @ngdoc function
   * @name openUserModal
   * @module starter.controllers
   * @kind function
   *
   * @description Open User modal to friend management
   */
  $scope.openUserModal = function() {
    $scope.modal.datas = [];
    $scope.modal.selection = [];
    $scope.modal.num = 1;
    $scope.modal.changed = false;
    $scope.modal.visible = true;
    $scope.modal.search = '';
    $scope.modal.show();
  };

  /**
   * @ngdoc function
   * @name removeFriend
   * @module starter.controllers
   * @kind function
   *
   * @description Save selected friends into server
   */
  $scope.removeFriend = function( friendId, itemInx ) {
    Friends.remove( friendId, function( data ){
      $scope.friends.splice(itemInx, 1);
      $scope.friendCount = $scope.friends.length;
    });
  };

  /**
   * @description make template for modal-user
   */
  $ionicModal.fromTemplateUrl('templates/modal-users.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.changed = false;
    $scope.modal.visible = false;
  });

  /**
   * @ngdoc eventHandler
   * @name modal.hidden
   * @module starter.controllers
   * @kind eventHandler
   *
   * @description event called when modal closing
   */
  $scope.$on('modal.hidden', function() {
    $scope.modal.visible = false;

    if($scope.modal.changed){
      // Sync friends with Server
      $scope.syncFriends();
      $scope.modal.changed = false;
    }
  });

  /**
   * @ngdoc eventHandler
   * @name modal.shown
   * @module starter.controllers
   * @kind eventHandler
   *
   * @description event called when modal opening
   */
  $scope.$on('modal.shown', function() {
    document.getElementById( "searchKey" ).value = "";
    $ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
  });
})

.controller('UsersModalCtrl', function($scope, Users, Sign, Friends) {

  /**
   * @ngdoc function
   * @name toggleSelection
   * @module starter.controllers
   * @kind function
   *
   * @description Push selected userId into selection array
   * @param {string} selected userId in user modal
   */
  $scope.toggleSelection = function( friendId ){
    var inx = $scope.modal.selection.indexOf( friendId );
    if( inx > -1 ){
      $scope.modal.selection.splice(inx, 1);
    } else {
      $scope.modal.selection.push( friendId );
    }
  };

  /**
   * @ngdoc function
   * @name addFriends
   * @module starter.controllers
   * @kind function
   *
   * @description Save selected friends into server
   */
  $scope.addFriends = function() {
    var res = $scope.modal.selection;

    if(res.length > 0){
      var addUsers = [];
      for( var key in res ){
        if( addUsers.indexOf( res[key] ) < 0 ){
          addUsers.push( res[key] );
        }
      }

      Friends.add( addUsers, function( data ){
        $scope.modal.changed = true;
        $scope.modal.hide();
      });
    }
  };

  $scope.searchUsers = function() {

    $scope.modal.visible = true;
    $scope.modal.num = 1;

    $scope.retrieveUsers();
  };

  /**
   * @ngdoc function
   * @name retrieveUsers
   * @module starter.controllers
   * @kind function
   *
   * @description Search user from server
   */
  $scope.retrieveUsers = function() {

    console.log('$scope.modal.visible : ',$scope.modal.visible, $scope.modal.num);
    if($scope.modal.visible){

      var loginUserId = Sign.getUser().userId;

      var query = {
        GR: {'$ne': loginUserId}
      };

      if($scope.modal.search) query['DT.NM'] = '%'+$scope.modal.search+'%';

      Users.search(query, $scope.modal.num, function(users){

        if( users !== undefined ){
          if($scope.modal.num > 1) {
            $scope.modal.datas = $scope.modal.datas.concat(users);
          }else{
            $scope.modal.datas = [];
            $scope.modal.datas = users;
            $scope.$apply();
          }

          $scope.modal.num = $scope.modal.num + 1;
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');

        if( !users || users.length < 50) {
          $scope.modal.visible = false;
        }
      });
    }
  };
})
.controller('FriendsModalCtrl', function($scope, $rootScope, $state, Users, Friends, Chat, UTIL, ChannelDao, Sign) {
  var loginUser = Sign.getUser();

  /**
   * @ngdoc function
   * @name toggleSelection
   * @module starter.controllers
   * @kind function
   *
   * @description Push selected userId into selection array
   */
  $scope.toggleSelection = function( friendId ){
    var inx = $scope.modal.selection.indexOf( friendId );
    if( inx > -1 ){
      $scope.modal.selection.splice(inx, 1);
    } else {
      $scope.modal.selection.push( friendId );
    }
  };

  /**
   * @ngdoc function
   * @name inviteFriends
   * @module starter.controllers
   * @kind function
   *
   * @description Invite friend to current channel
   *  1:1 channel : create new channel for multiple channel
   *  multiple channel : Add selected friends into current channel and change channel name
   */
  $scope.inviteFriends = function() {
    var res = $scope.modal.selection;
    var channelId = $scope.modal.channelId;
    var channelName = $scope.modal.channelName;
    var channelUsers = $scope.modal.channelUsers;

    // Selected Friends array
    if(res.length > 0){

      var joinUsers = [];

      // Selection -> join users
      for( var key in res ){
        joinUsers.push( res[key] );

        if( channelUsers.indexOf( res[key] ) < 0 ){
          channelUsers.push( res[key] );
        }
      }

      $scope.modal.channelUsers = channelUsers;

      // 1:1 channel
      if( channelId.indexOf( "$" ) > -1 ){

        // create new channel for multiple user
        $rootScope.$stateParams.friendIds = channelUsers.join( "$" );
        $state.transitionTo('chat', {}, { reload: true, inherit: true, notify: true });
      } else {
        // Add selected friends into current channel and change channel name
        channelName = channelName + ","+UTIL.getNames( joinUsers );
        $scope.modal.channelName = channelName;

        // Update channel info server with current channel info
        var joinObject = { 'U' : joinUsers, 'DT' : { 'NM' : channelName,'US' : channelUsers, 'F' : loginUser.userName, 'UC': channelUsers.length } };
        Chat.join( channelId, joinObject, function(data){
          if( data.status == 'ok' ){
            var iMsg = UTIL.getInviteMessage( joinUsers );

            // Send channel join message and update channel info in local db
            Chat.send( iMsg, 'J' );
            ChannelDao.updateUsers( { 'channel': channelId, 'name' : channelName, 'users': channelUsers } );
          }
        });
      }

      $scope.modal.changed = true;
      $scope.modal.hide();
    }
  };

  /**
   * @ngdoc function
   * @name postFriends
   * @module starter.controllers
   * @kind function
   *
   * @description Apply friends display.
   * @param {array} filtered friends by searchKey;
   */
  $scope.postFriends = function(friends){
    if( friends != undefined ){
      $scope.modal.datas = [];
      $scope.modal.datas = friends;
    }
  };

  /**
   * @ngdoc function
   * @name resetFriends
   * @module starter.controllers
   * @kind function
   *
   * @description Reset friends list
   */
  $scope.resetFriends = function(){
    Friends.list(function(friends){
      if( friends != undefined ){
        $scope.modal.datas = [];
        $scope.modal.datas= friends;
      }
    });
  };
})

.controller('AccountCtrl', function($scope, $rootScope, Sign) {
  $scope.loginUser = Sign.getUser();

  $scope.newImage = '';

  /**
   * @ngdoc function
   * @name changeImage
   * @module starter.controllers
   * @kind function
   *
   * @description Reset friends list
   * @param {string} new image url;
   */
  $scope.updateUserInfo = function(newImage){
    if( newImage !== '' ){
      $scope.loginUser.image = newImage;
    }

    // A : applicationId
    var params = { 'A' : 'messengerx', 'U' : $scope.loginUser.userId, 'PW' : $scope.loginUser.password, 'D' : $rootScope.deviceId, 'N' : $rootScope.notiId,
               DT : { 'NM' : $scope.loginUser.userName, 'I': $scope.loginUser.image, 'MG' : $scope.loginUser.message } };

    // update userInfo in server
    Sign.update( params, function(data){
      if( data.status === 'ok' ){
        // set updated user info current session
        Sign.setUser( $scope.loginUser );
      }
    });
  };
})
.controller('EmoticonCtrl', function($scope, $rootScope, $ionicPopup, Sign, ChannelDao, Chat, Emoticons) {
  var loginUser = Sign.getUser();
  var channelId = '';

  $scope.emoticon = {};
  Emoticons.list( { group : 'custom' }, function(emoticons){
    if( emoticons.length > 0 ){
      $scope.emoticon = emoticons[0];
    }
  });

  /**
   * @ngdoc function
   * @name openFileDialog
   * @module starter.controllers
   * @kind function
   *
   * @description open file dialog
   */
  $scope.openFileDialog = function() {
    ionic.trigger('click', { target: document.getElementById('file') });
  };

  /**
   * @ngdoc function
   * @name initSelfChannel
   * @module starter.controllers
   * @kind function
   *
   * @description make self channel for emoticon file upload
   */
  var initSelfChannel = function(){

    // self channel for loginUser
    var channelUsers = [loginUser.userId];

    var createObject = {};
    createObject.U = channelUsers;    
    channelId = ChannelDao.generateId(createObject);    
    createObject.DT = { 'US' : channelUsers, 'UC': channelUsers.length };
    createObject.C = channelId;

    $rootScope.xpush.createChannel(channelUsers, channelId, createObject.DT, function(data){

      var param = {};
      param.app = loginUser.app;
      param.channel = channelId;
      param.userId = loginUser.userId;
      param.deviceId = loginUser.deviceId;

      // Channel Init
      Chat.init( param, $scope, function( messages ){
      });
    });
  };

  // Initialize this controller
  initSelfChannel();

  /**
   * @ngdoc eventHandler
   * @name inputObj
   * @module starter.controllers
   * @kind eventHandler
   *
   * @description make self channel for emoticon file upload
   */
  var inputObj = document.getElementById('file');
  var progressbar = document.getElementById( "progress_bar" );

  angular.element( inputObj ).on('change',function(event) {

    var file = inputObj.files[0];

    // Type check
    if( file.type.indexOf( "image" ) < 0 ){
      var alertMessage = {title: 'Upload Failed'};
      alertMessage.subTitle = 'Upload only images';

      $ionicPopup.alert( alertMessage );
      inputObj.value = ""
      return;
    }

    // upload file stream
    $rootScope.xpush.uploadStream( channelId, {
      file: inputObj
    }, function(data, idx){
      inputObj.value = "";
      progressbar.value = data;
      progressbar.style.display = "block";
    }, function(data,idx){
      var name = data.result.name;

      inputObj.value = "";
      console.log("completed ["+idx+"]: "+JSON.stringify(data));

      var imageUrl = $rootScope.xpush.getFileUrl(channelId, name );
      var param = {group:'custom', tag :'', image : imageUrl};
      progressbar.style.display = "none";

      // Save emoticon to local db
      Emoticons.add( param, $scope.emoticon );
    });
  });
})
.controller('SplashCtrl', function($state, $scope, $rootScope, Sign, Cache, Friends ) {

  var delay = 1500;
  setTimeout( function (){
    var storedUser = Sign.restoreUser();
    if( storedUser != undefined ){
      
      $rootScope.xpush.login( storedUser.userId, storedUser.password, storedUser.deviceId, 'ADD_DEVICE', function(err, result){

        $rootScope.loginUser = storedUser;
        
        // Save session Info
        Sign.setUser( storedUser );

        // Push userImage and userName into local cache oject
        Cache.add(storedUser.userId, {'NM':storedUser.userName, 'I':storedUser.image});

        // Retrieve refresh history for sync friends
        Friends.getRefreshHistory(function(history){

          // Do not update within an hour( 60s )
          if( history != undefined && ( history.time - Date.now() ) < 60000 ){
            $rootScope.syncFlag = false;
          } else {
            $rootScope.syncFlag = true;
          }

          $state.go('tab.friends');
        });
      });
    } else {
      $state.go('signin');
    }
  }, delay);
})
.controller('SignInCtrl', function($scope, $rootScope, $state, $location, $stateParams, $ionicPopup, Friends, Sign, Cache) {

  if( window.root ){
    $scope.hideNavbar = "false";
  } else {
    $scope.hideNavbar = "true";
  }

  /**
   * @ngdoc function
   * @name signIn
   * @module starter.controllers
   * @kind function
   *
   * @description Authorization
   * @param {jsonObject} Json object that is mapped to the screen
   */
  $scope.signIn = function(user) {
		var params = { 'A' : 'messengerx', 'U' : user.userId, 'PW' : user.password, 'D' : $rootScope.deviceId, 'N' : $rootScope.notiId };
    $rootScope.xpush.login( user.userId, user.password, $rootScope.deviceId, 'ADD_DEVICE', function(err, result){

      if(err){
        var alertMessage = {title: 'Login Failed'};
        if(err == 'ERR-NOTEXIST'){
          alertMessage.subTitle = 'User is not existed. Please try again.';
        }else if(err == 'ERR-PASSWORD'){
          alertMessage.subTitle ='Password is wrong. Please try again.'; // Forgot your password?
        }else {
          alertMessage.subTitle = 'Invalid log in or server error. Please try again.';
        }

        $ionicPopup.alert(alertMessage);

      }else{

        // Create current session Info
        var loginUser = {};
        loginUser.app = params.A;
        loginUser.userId = user.userId;
        loginUser.password = params.PW;
        loginUser.deviceId = $rootScope.deviceId;

        loginUser.image = result.user.DT.I;
        loginUser.userName = result.user.DT.NM;
        loginUser.message = result.user.DT.MG;

        $rootScope.loginUser = loginUser;

        // Save session Info
        Sign.setUser( loginUser );

        // Push userImage and userName into local cache oject
        Cache.add(user.userId, {'NM':loginUser.userName, 'I':loginUser.image});

        // Retrieve refresh history for sync friends
        Friends.getRefreshHistory(function(history){

          // Do not update within an hour( 60s )
          if( history != undefined && ( history.time - Date.now() ) < 60000 ){
            $rootScope.syncFlag = false;
          } else {
            $rootScope.syncFlag = true;
          }

          $state.go('tab.friends');
        });
      }
    });
  };

  $scope.$watch('$viewContentLoaded', function() {
    document.getElementById( "userId" ).focus();
  });
})
.controller('SignUpCtrl', function($scope, $rootScope, $state, $stateParams, $http, Sign) {
  /**
   * @ngdoc function
   * @name signUp
   * @module starter.controllers
   * @kind function
   *
   * @description Create user into server
   * @param {jsonObject} Json object that is mapped to the screen
   */
  $scope.signUp = function(user) {
    var params = { 'A' : 'messengerx', 'U' : user.userId, 'PW' : user.password, 'D' : $rootScope.deviceId, 'N' : $rootScope.notiId,
     'DT' : {'NM' : user.userName, 'I':'img/default_image.jpg', 'MG':'' } };
    Sign.register( params, function(data){
      $state.go('signin');
    });
  };
})
.controller('ChatCtrl', function($state, $scope, $rootScope, $ionicPopup, $ionicFrostedDelegate, Manager, $ionicScrollDelegate,  $ionicModal, $window, Friends, Sign, Chat, Cache, ChannelDao, NoticeDao, UTIL, Emoticons) {

  var loginUser = Sign.getUser();

  var channelId;
  var channelName;
  var channelUsers = [];

  if( loginUser !=undefined ){
    $scope.loginUserImage = loginUser.image;
  }

  /**
   * @ngdoc eventHandler
   * @name INTER_WINDOW_DATA_TRANSFER
   * @module starter.controllers
   * @kind eventHandler
   *
   * @description Generate a pop-up screen from th parent screen
   * @param {jsonObject}
   * @param {jsonObject} Json object from the parent screen
   */
  $rootScope.$on("INTER_WINDOW_DATA_TRANSFER", function (data, args) {
    // Copy session object and cache object

    Sign.setUser( args.loginUser );
    Cache.set( args.cache );
    loginUser = Sign.getUser();

    $scope.loginUserImage = loginUser.image;

    $rootScope.xpush.setSessionInfo( loginUser.userId, loginUser.deviceId, function(){

      $rootScope.xpush._sessionConnection = args.sessionConnection;
      $rootScope.xpush.isExistUnread = false;

      // Initialize chat controller
      channelId = args.stateParams.channelId;
      if( channelId != undefined ){
        $rootScope.xpush._getChannelAsync( channelId, function(){
          init( args.stateParams, args.parentScope );
          Manager.addEvent();
        });
      } else {
        init( args.stateParams, args.parentScope );
        Manager.addEvent();
      }
    });

    $rootScope.$on('$windowBlur',  function (){
      Chat.sendSys( 'off' );
    });

    $rootScope.$on('$windowFocus', function (){
      Chat.sendSys( 'on' );
    });
  });

  /**
   * @ngdoc function
   * @name initChat
   * @module starter.controllers
   * @kind function
   *
   * @description Initialize Chat service
   * @param {jsonObject}
   * @param {String} Invite Message
   */
  var initChat = function( inviteMsg, parentScope ){

    $rootScope.currentScope = $scope;

    var param = {};
    param.app = loginUser.app;
    param.channel = channelId;
    param.userId = loginUser.userId;
    param.deviceId = loginUser.deviceId;

    // Channel Init
    Chat.init( param, inviteMsg, $scope, function( messages ){
      if( messages != undefined ){

        // Message in local database
        $scope.messages = $scope.messages.concat(messages);

        setTimeout( function(){
          $ionicFrostedDelegate.update();
          $ionicScrollDelegate.scrollBottom(true);

          if( parentScope != undefined ){
            var args = {"channelId":channelId};

            // Broadcast ON_POPUP_OPEN event for 
            parentScope.$broadcast("ON_POPUP_OPEN", args);
          }
        }, 300 );
      }

      // Retreive notice from DB
      NoticeDao.get( channelId ).then(function(data) {
        if( data !== undefined ){
          var dateStrs = UTIL.timeToString( data.updated );

          // YYYYMMDD min:ss
          var dateMessage = dateStrs[1]+" "+dateStrs[2];

          var noticeMessage = { date : dateMessage, message : data.message, name : Cache.get( data.sender_id ).NM,
                                image : Cache.get( data.sender_id ).I , useFlag : data.use_flag, foldFlag : data.fold_flag };
          $scope.setNotice( noticeMessage );
        }
      });
    });
  };

  $scope.messages = [];
  var stateParams = $rootScope.$stateParams;

  /**
   * @ngdoc function
   * @name init
   * @module starter.controllers
   * @kind function
   *
   * @description Initialize current controller
   * @param {jsonObject} channelId, channelName, channelUsers
   */
  var init = function( stateParams, parentScope ){

    // If channelId is exist, use the channel
    if( stateParams.channelId !== undefined ) {
      channelId = stateParams.channelId;

      channelUsers = stateParams.channelUsers.split(",");
      channelUsers.sort();
      channelName = stateParams.channelName;

      initChat( '', parentScope );
    } else {
      // make friend string to array
      var friendIds = stateParams.friendIds.split("$");
      channelUsers = channelUsers.concat( friendIds );

      if( channelUsers.indexOf( loginUser.userId ) < 0 ){
        channelUsers.push( loginUser.userId );
      }

      channelName = UTIL.getNames( channelUsers );

      var createObject = {};
      createObject.U = channelUsers;
      createObject.NM = channelName;
      createObject.DT = { 'NM' : channelName, 'US' : channelUsers, 'F' : loginUser.userName, 'UC': channelUsers.length };

      // Generate channel id
      channelId = ChannelDao.generateId(createObject);
      createObject.C = channelId;

      // Create channel with channel info and save into local db
      $rootScope.xpush.createChannel(channelUsers, channelId, createObject.DT, function(data){
        createObject.unreadCount = 0;
        ChannelDao.insert( createObject );

        var inviteMsg = "";
        if( channelUsers.length > 2 ){
          inviteMsg = UTIL.getInviteMessage( channelUsers );
        }

        initChat( inviteMsg, parentScope );
      });
    }

    // Reset $stateParams
    $rootScope.$stateParams = {};
    $scope.channelName = channelName;
    $scope.channelId = channelId;
    $scope.channelUsers = channelUsers;


    // Retrieve emoticon list from local db.
    Emoticons.list( {}, function(emoticons){
      var rootImgPath = $rootScope.rootImgPath;
      $scope.emoticons.push( { group : 's2', tag : 'ion-happy', 'CN' : 'tab-item tab-item-active', items : {
          "01" : [rootImgPath+'/emo/s2/anger.PNG', rootImgPath+'/emo/s2/burn.PNG', rootImgPath+'/emo/s2/cool.PNG', rootImgPath+'/emo/s2/love.PNG'],
          "02" : [rootImgPath+'/emo/s2/shout.PNG', rootImgPath+'/emo/s2/smile.PNG']}}
      );
      $scope.emoticons = $scope.emoticons.concat( emoticons );
      //$scope.emoticons['b2'] = [rootImgPath+'/emo/b2/anger.png', rootImgPath+'/emo/b2/cry.png',  rootImgPath+'/emo/b2/haha.png', rootImgPath+'/emo/b2/money.png'];
    });
  };

  if( stateParams !== undefined ){
    init( stateParams );
  }

  /**
   * @ngdoc function
   * @name add
   * @module starter.controllers
   * @kind function
   *
   * @description Add message to screen and Update scroll
   * @param {jsonObject} channelId, channelName, channelUsers
   */
  $scope.add = function( nextMessage ) {
    $scope.messages.push(angular.extend({}, nextMessage));
    $scope.$apply();

    // Update the scroll area and tell the frosted glass to redraw itself
    if( nextMessage.from !== 'RI' && nextMessage.from !== 'SI' ){
      $ionicFrostedDelegate.update();
      $ionicScrollDelegate.scrollBottom(true);
    }
  };

  /**
   * @ngdoc function
   * @name addNotice
   * @module starter.controllers
   * @kind function
   *
   * @description Display noticeMsg
   * @param {string} noticeMsg
   */
  $scope.setNotice = function( noticeMsg ) {
    $scope.notice = noticeMsg;
    $scope.toggleNotice( true );
  };

  /**
   * @ngdoc function
   * @name send
   * @module starter.controllers
   * @kind function
   *
   * @description Send Message and reset input text
   * @param {jsonObject} channelId, channelName, channelUsers
   */
  $scope.send = function() {
    if( $scope.inputMessage !== '' ){
      var msg = $scope.inputMessage;
      $scope.inputMessage = '';
      Chat.send( msg );
    }
  };

  $scope.selection = [];

  /**
   * @ngdoc function
   * @name openFriendModal
   * @module starter.controllers
   * @kind function
   *
   * @description Open User modal to friend management
   */
  $scope.openFriendModal = function() {

    Friends.list(function(friends){

      if( friends != undefined ){
        $scope.modal.datas =  [];
        $scope.modal.datas = friends;
      }

      $scope.modal.selection = [];
      $scope.modal.num = 1;
      $scope.modal.changed = false;
      $scope.modal.visible = true;
      $scope.modal.show();
      $scope.modal.channelUsers = $scope.channelUsers;
      $scope.modal.channelName = $scope.channelName;
      $scope.modal.channelId = $scope.channelId;
    });
  };

  $ionicModal.fromTemplateUrl('templates/modal-friends.html', function(modal) {
    $scope.modal = modal;
    $scope.modal.changed = false;
    $scope.modal.visible = false;
  }, {
    animation: 'slide-in-up',
    focusFirstInput: true
  });

  $scope.$on('modal.hidden', function() {
    $scope.modal.visible = false;

    if($scope.modal.changed){
      $scope.modal.changed = false;
      $scope.channelName = $scope.modal.channelName;
      $scope.channelUsers = $scope.modal.channelUsers;
    }
  });

  $scope.$on('modal.shown', function() {
    document.getElementById( "searchKey" ).value = "";
  });

  /**
  $scope.$on('$destroy', function() {
     window.onbeforeunload = undefined;
  });
  */

  /**
   * @ngdoc eventHandler
   * @name openFriendModal
   * @module starter.controllers
   * @kind eventHandler
   *
   * @description Open User modal to friend management
   * @param {object} event
   * @param {object} next state
   * @param {object} currnet state
   */

  /**
  $scope.$on('$locationChangeStart', function(event, next, current) {

    // called when chat screen out
    if( current.indexOf('/chat') > -1 ){
      if(!confirm("Are you sure you want to leave this page?")) {
        event.preventDefault();
      }
    }
  });
  */

  /**
   * @ngdoc function
   * @name openWebRTC
   * @module starter.controllers
   * @kind function
   *
   * @description Open webRTC for video chatting
   * @param {string} webRTC key
   */
  $scope.openWebRTC = function( key ){
    $scope.toggleExt( false );

    var newFlag = false;
    if( key === undefined ){
      newFlag = true;
    }

    var chKey = newFlag ? UTIL.getUniqueKey() : key;

    var params = {
      S: $rootScope.host,
      A: $rootScope.app,
      C: chKey,
      U: {
        U: loginUser.userId,
        A: loginUser.deviceId
      }
    };

    var url = $rootScope.rootPath+'videoChat.html?'+encodeURIComponent(JSON.stringify(params));

    var popup = $window.open(url, chKey, "width=800,height=600");
    popup.onbeforeunload = function(){
      Chat.send( chKey, 'VO' );
    };

    // Send video call
    if( newFlag ){
      Chat.send( chKey, 'VI' );
    }
  };

  $scope.emoticons = [];

  $scope.curEmoTabId = "0";
  $scope.showEmo = false;
  $scope.showExt = false;
  $scope.watching = false;

  /**
   * @ngdoc function
   * @name toggleEmoticons
   * @module starter.controllers
   * @kind function
   *
   * @description show or hide emoticon div
   * @param {boolean}
   */
  $scope.toggleEmoticons = function( flag ){
    $scope.showEmo = flag;
    if( $scope.showEmo === true ){
      document.getElementById( 'tabbody'+$scope.curEmoTabId ).style.display = "block";
      document.getElementById( 'chat-emoticons' ).style.display = "block";
      document.getElementById( "chat-extends" ).style.display = "none";
      document.getElementById( "chat-notice" ).style.display = "none";      
      $scope.showExt = false;
    } else {
      document.getElementById( 'chat-emoticons' ).style.display = "none";
      $scope.toggleNotice( true );
    }
  };

  /**
   * @ngdoc function
   * @name toggleExt
   * @module starter.controllers
   * @kind function
   *
   * @description show or hide extension div
   * @param {boolean}
   */
  $scope.toggleExt = function( flag ) {
    $scope.showExt = flag;
    if( $scope.showExt === true ){
      document.getElementById( "chat-extends" ).style.display = "block";
      document.getElementById( 'chat-emoticons' ).style.display = "none";
      document.getElementById( "chat-notice" ).style.display = "none";
      $scope.showEmo = false;
    } else {
      document.getElementById( "chat-extends" ).style.display = "none";
      $scope.toggleNotice( true );
    }
  };

  /**
   * @ngdoc function
   * @name toggleNotice
   * @module starter.controllers
   * @kind function
   *
   * @description show or hide Notice div
   * @param {boolean}
   */
  $scope.toggleNotice = function( flag ) {
    if( flag && $scope.notice && $scope.notice.useFlag === 'Y' && !$scope.showEmo && !$scope.showExt ){
      if( $scope.notice.foldFlag == 'N' ) {
        document.getElementById( "chat-notice" ).style.display = "block";
        document.getElementById( "chat-notice-button" ).style.display = "none";
      } else {
        document.getElementById( "chat-notice" ).style.display = "none";
        document.getElementById( "chat-notice-button" ).style.display = "block";
      }
    } else {
      document.getElementById( "chat-notice" ).style.display = "none";
      document.getElementById( "chat-notice-button" ).style.display = "none";
    }
  };

  /**
   * @ngdoc function
   * @name toggleNotice
   * @module starter.controllers
   * @kind function
   *
   * @description show or hide Notice div's menu
   * @param {boolean}
   */  
  $scope.toggleNoticeMenu = function(){
    if( $scope.showNoticeMenu ){      
      document.getElementById( "chat-notice-menu" ).style.display = "none";
      document.getElementById( "notice-message" ).style.whiteSpace =  "nowrap";      
      $scope.showNoticeMenu = false;
    } else {
      document.getElementById( "notice-message" ).style.whiteSpace = "normal";
      document.getElementById( "chat-notice-menu" ).style.display = "flex";      
      $scope.showNoticeMenu = true;
    }
  }

  /**
   * @ngdoc function
   * @name sendEmoticon
   * @module starter.controllers
   * @kind function
   *
   * @description Send selected emoticon url
   * @param {string} url
   */
  $scope.sendEmoticon = function(url){
    $scope.toggleEmoticons( false );
    document.getElementById( 'chat-emoticons' ).style.display = "none";
    Chat.send( url, 'E' );
  };

  /**
   * @ngdoc function
   * @name tabActive
   * @module starter.controllers
   * @kind function
   *
   * @description Active selected tab and deactive another tab
   * @param {string} selected tabId
   */
  $scope.tabActive = function( tabId ){
    $scope.curEmoTabId = tabId;
    var tabs = document.getElementById( 'emoticon-tabs' ).getElementsByTagName( "a" );

    for( var inx = 0, until = tabs.length; inx < until; inx++ ){
      if( tabs[inx].id == "tab"+tabId ){
        tabs[inx].className = "tab-item tab-item-active";
        document.getElementById( "tabbody"+inx ).style.display = "block";
      } else {
        tabs[inx].className = "tab-item";
        document.getElementById( "tabbody"+inx ).style.display = "none";
      }
    }
  };


  /**
   * @ngdoc eventHandler
   * @name openFileDialog
   * @module starter.controllers
   * @kind eventHandler
   *
   * @description make self channel for emoticon file upload
   */
  var itemInx = 0;
  $scope.openFileDialog = function( sourceType ) {
    // If android or IOS, use native plugin
    if( navigator.camera ){

      var opts = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: sourceType,
        encodingType: 0
      };

      navigator.camera.getPicture(onSuccess, onFail, opts);

      function onSuccess(FILE_URI) {
        $scope.toggleExt( false );

        var options = {type : 'image'};

        var tp = "SFP";

        var thisInx = itemInx;
        var nextMessage = { type : tp, inx : thisInx, message : inputObj.value };

        $scope.messages.push(angular.extend({}, nextMessage));
        $scope.$apply();

        setTimeout( function(){
          var progressbar = document.getElementById( "progress_bar"+thisInx );
          var tempDiv = document.getElementById( "progress_div"+thisInx );

          $ionicFrostedDelegate.update();
          $ionicScrollDelegate.scrollBottom(true);

          $rootScope.xpush.uploadFile(channelId, FILE_URI,
          options,
          function ( data ){
            progressbar.value = data;
          },
          function (data){
            var imageUrl = $rootScope.xpush.getFileUrl(channelId, JSON.parse(data.response).result.tname );

            angular.element( tempDiv ).remove();
            Chat.send( imageUrl, 'I' );
          });
        }, 100 );
        itemInx++;
      }

      function onFail(message) {
        $scope.toggleExt( false );
        console.log(message);
        itemInx++;
      }
    } else {
      // If using browser, use file dialog
      $scope.toggleExt( false );
      ionic.trigger('click', { target: document.getElementById('file') });
    }
  };

  var inputObj = document.getElementById('file');
  angular.element( inputObj ).on('change',function(event) {

    var file = inputObj.files[0];
    var sizeLimit = 20;

    if( file.size > 1024 * 1024 * sizeLimit ){

      $ionicPopup.alert({
        title: 'Upload failed',
        template: 'File size exceeds limit : '+ sizeLimit +'M'
      });

      inputObj.value = "";
      return;
    }

    var type = UTIL.getType( inputObj.value );

    var options = {
      file: inputObj
    };

    if( type === 'image' ){
      options.type = "image";
    }

    var tp = "";

    // if video, add vido progress bar. Otherwise show progress bar.
    if( type === 'video' ){
      tp = "SVP";
    } else {
      tp = "SFP";
    }

    var nextMessage = { type : tp, inx : itemInx, message : inputObj.value };
    var thisInx = itemInx;

    $scope.messages.push(angular.extend({}, nextMessage));
    $scope.$apply();
    itemInx++;

    setTimeout( function(){
      $ionicFrostedDelegate.update();
      $ionicScrollDelegate.scrollBottom(true);
      uploadStream( options, type, thisInx );
    }, 100 );
  });

  /**
   * @ngdoc function
   * @name uploadStream
   * @module starter.controllers
   * @kind function
   *
   * @description upload file using socket stream.
   */
  var uploadStream = function( options, type, itemJnx ){
    var progressbar = document.getElementById( "progress_bar"+itemJnx );
    var tempDiv = document.getElementById( "progress_div"+itemJnx );

    $rootScope.xpush.uploadStream( channelId, options, function(data, idx){
      inputObj.value = "";

      // Update progress bar
      progressbar.value = data;
    }, function(data,idx){
      var msg;
      var msgType;

      if( type === 'image' ){
        msg = $rootScope.xpush.getFileUrl(channelId, data.result.tname );
        msgType = 'I';
      } else if ( type === 'video' ) {
        msg = data.result.name;
        msgType = 'V';
      } else {
        msg = $rootScope.xpush.getFileUrl(channelId, data.result.name );
        msgType = 'I';
      }

      // remove progress bar
      angular.element( tempDiv ).remove();
      inputObj.value = "";
      console.log("completed ["+idx+"]: "+JSON.stringify(data));

      Chat.send( msg, msgType );
    });
  };

  /**
   * @ngdoc function
   * @name showNoticePopup
   * @module starter.controllers
   * @kind function
   *
   * @description Open Notice popup to input notice message
   */
  $scope.showNoticePopup = function() {
    $scope.data = {}

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="type" ng-model="data.notice">',
      title: 'Input Notice',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.notice) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.notice;
            }
          }
        },
      ]
    });
    myPopup.then(function(noticeMessage) {
      if( noticeMessage !== undefined ){
        Chat.send( noticeMessage, 'N' );
      }
    });
  };

  /**
   * @ngdoc function
   * @name updateNotice
   * @module starter.controllers
   * @kind function
   *
   * @description Update Notice option
   */
  $scope.updateNotice = function( useFlag, foldFlag ) {
    var param = {'channelId': channelId, useFlag : useFlag, foldFlag : foldFlag };

    // Update notice at local DB;
    NoticeDao.update( param );

    if( $scope.notice !== undefined ){
      $scope.notice.useFlag = param.useFlag;
      $scope.notice.foldFlag = param.foldFlag;
    }

    if( useFlag === 'N' ){
      $scope.toggleNotice( false );      
    } else {
      $scope.toggleNotice( true );
    }
  };


  /**
   * @ngdoc function
   * @name setOnlineStatus
   * @module starter.controllers
   * @kind function
   *
   * @description Set frined's online status on off
   */
  $scope.setOnlineStatus = function( msg ){
    var btnStatus = document.getElementById( "online-status" );
    if( msg === "on" ){
      $scope.watching = true;
    } else {
      $scope.watching = false;
    }
    $scope.$apply();
  };
})
.controller('ViewCtrl', function($scope, $rootScope) {

  if( window.root ){
    $scope.hideNavbar = "false";

    var gui = require('nw.gui');
    var win = gui.Window.get();
    win.setMinimumSize(100, 100);
  } else {
    $scope.hideNavbar = "true";
  }

  var query = document.location.href;
  var vars = query.split("&");
  var type = vars[0].split("=")[1];
  var srcName=decodeURIComponent( query.split("src=")[1] ).replace( "#/", "");

  $scope.movieSrc = "";

  $scope.$watch('$viewContentLoaded', function() {

    var offsetX = $scope.hideNavbar=="true"?16:0;
    var offsetY = 0;

    var topBarY = $scope.hideNavbar=="true"?0:44;

    if( type == 'SI' || type == 'RI'  ){
      var imgObj =  document.getElementById('imgContent');
      imgObj.style.display = "block";
      var element = angular.element( imgObj );

      element.bind( 'load', function (){
        offsetY = imgObj.scrollWidth > screen.width ? 84+ topBarY: 66+topBarY;
        console.log( imgObj.width );
        console.log( imgObj.height );
        window.resizeTo(imgObj.width+offsetX, imgObj.height+offsetY);
      });

      $scope.imageSrc = srcName;
    } else if( type == 'SV' || type == 'RV' ) {
      var video =  document.getElementById('videoContent');
      var videoSourceObj =  document.getElementById('videoSource');

      video.style.display = "block";
      video.src = srcName;

      video.addEventListener('loadeddata', function (){
        offsetY = video.videoWidth > screen.width ? 84+ topBarY: 66+topBarY;
        window.resizeTo(video.videoWidth+offsetX, video.videoHeight+offsetY);  
      });    
    }
  });

  $scope.close = function(){
    window.close();
  };
});
