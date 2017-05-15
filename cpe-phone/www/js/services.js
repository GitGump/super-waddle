angular.module('cpe-phone.services', ['LocalStorageModule', 'ngMessages', 'toastr'])

  .config(['localStorageServiceProvider',
    function(localStorageServiceProvider) {
      localStorageServiceProvider
        .setPrefix('cpe')
        .setStorageType('sessionStorage')
        .setStorageCookie(1, '/');
    }
  ])

  .config(['toastrConfig',
    function(toastrConfig) {
      angular.extend(toastrConfig, {
        autoDismiss: true,
        extendedTimeOut: 1000,
        timeOut: 2000,
        preventDuplicates: false,
        preventOpenDuplicates: true,
        tapToDismiss: true,
        newestOnTop: true,
        positionClass: 'toast-bottom-full-width',
        target: 'body'
      })
    }
  ])

  .constant('serviceConstant', {
    wirelessModes: [{
      name: '802.11b', value: '0'
    }, {
      name: '802.11g', value: '1'
    }, {
      name: '802.11b/g', value: '2'
    }, {
      name: '802.11n', value: '3'
    }, {
      name: '802.11b/b/n mixed', value: '4'
    }, {
      name: '11a', value: '5'
    }, {
      name: '802.11g', value: '6'
    }, {
      name: '11a/n mixed', value: '7'
    }, {
      name: '11a/n/ac mixed', value: '8'
    }],
    encryptions: [{
      name: '无加密', value: '0'
    }, {
      name: 'WPA-PSK / WPA2-PSK', value: '1'
    }],
    channels: [{
      name: '自动', value: '0'
    }, {
      name: '1/2412MHz', value: '1'
    }, {
      name: '2/2417MHz', value: '2'
    }, {
      name: '3/2422MHz', value: '3'
    }, {
      name: '4/2427MHz', value: '4'
    }, {
      name: '5/2432MHz', value: '5'
    }, {
      name: '6/2437MHz', value: '6'
    }, {
      name: '7/2442MHz', value: '7'
    }, {
      name: '8/2447MHz', value: '8'
    }, {
      name: '9/2452MHz', value: '9'
    }, {
      name: '10/2457MHz', value: '10'
    }, {
      name: '11/2462MHz', value: '11'
    }, {
      name: '12/2467MHz', value: '12'
    }, {
      name: '13/2472MHz', value: '13'
    }, {
      name: '36/5180MHz', value: '36'
    }, {
      name: '40/5200MHz', value: '40'
    }, {
      name: '44/5220MHz', value: '44'
    }, {
      name: '48/5240MHz', value: '48'
    }, {
      name: '149/5745MHz', value: '149'
    }, {
      name: '153/5765MHz', value: '153'
    }, {
      name: '157/5785MHz', value: '157'
    }, {
      name: '161/5805MHz', value: '161'
    }, {
      name: '165/5825MHz', value: '165'
    }],
    bandwidths: [{
      name: '自动', value: '0'
    }, {
      name: '20MHz', value: '1'
    }, {
      name: '20/40MHz', value: '2'
    }, {
      name: '20/40/80MHz', value: '3'
    }],
    OPMODE: {
      AP: '1',
      CLIENT: '2'
    },
    STR: {
      COMMON: {
        BUTTON: {
          OK: '确定',
          CANCEL: '取消',
          NEXT: '下一步',
          CLOSE: '关闭'
        },
        ALERT: {
          FAIL: '操作失败',
          FAILED: '已失败',
          SUCCESS: '成功',
          FAILGETDATA: '获取数据失败',
          FAILSETDATA: '设置失败',
          UNKNOWNERR: '操作出现异常，请稍候再试'
        },
        LABEL: {
          ISSETTING: '正在设置CPE...'
        },
        ERRORCODE: {
          DEFAULT: '操作失败',
          // 网络参数通用错误
          e40301: 'IP地址不正确',
          e40302: '组播的IP地址',
          e40303: 'IP地址格式错误',
          e40304: '回环的IP地址',
          e40305: '掩码不正确',
          e40306: '网关不正确',
          e40307: '网关不可达',
          e40308: '网段冲突',
          e40309: '非法的网段',
          e40314: '网络号全0或者1',
          e40315: '主机号全0或者1',
          e40317: 'IP和掩码不匹配',
          // 模块wireless错误
          e50201: '无线密码为空',
          e50202: 'SSID超过最大合法长度',
          e50203: '无线安全设置的认证类型错误',
          e50204: 'WEP认证类型错误',
          e50205: 'RADIUS认证类型错误',
          e50206: 'PSK认证类型错误',
          e50207: '加密算法错误',
          e50208: 'radius密钥短语长度错误',
          e50209: 'psk密钥短语错误',
          e50210: '组密钥更新周期错误',
          e50211: 'WEP密钥类型错误',
          e50212: '默认WEP密钥索引错误',
          e50213: 'WEP密钥长度错误',
          e50225: '密码错误',
          e50237: '输入SSID为空，请检查后重新输入',
          e50239: '输入的SSID为全空格，请检查后重新输入',
          e50241: '寻位被打断',
          e50242: '其他错误'
        }
      },
      LOGIN: {
        ALERT: {
          WRONGUSERNAMEPWD: '用户名或者密码不正确',
          SESSIONTIMEOUT: '会话超时，请重新登录',
          CLIENTLOCKED: '用户名或密码输入错误次数过多，请重启设备后再尝试登录'
        }
      }
    },
    AUTH_RESULT: {
      SUCCESS: 0,
      AUTH_ERROR: -40401,
      PASSWORD_ERROR: -40401,
      VERIFY_CODE_ERROR: -40402,
      SESSION_TIMEOUT: -40403,
      CLIENT_LOCKED: -40404,
      FACTORY_STATUS: -40405,
      EXECEED_MAX_CLIENT: -40406,
      OTHER_ERROR: -40407,
      SYSTEM_LOCKED: -40408
    },
    ATTTEMPT_LOGIN_TIMES_MAX: 10
  })

  .value('serviceValue', {
    isFactory: false,
    isStartOver: false,
    isLogin: false,
    isSessionTimeout: false,
    isLocked: false,
    serverProtocol: 'http:',
    serverIp: '192.168.1.254',
    serverDns: 'tplogin.cn',
    slpUrl: '',
    deviceName: '',
    devicePlatform: undefined,
    attemptLoginTimesLeft: 10,
    wireless5GModes: [],
    wireless5GChannels: [],
    wireless5GBandwidths: [],
    isSuccess: false,
    global: {
      local: {},
      server: {}
    }
  })

  .factory('utilService', [
    function() {
      var ipToInt = function(ip) {
        var ip = toString(ip);
        var seg = ip.split('.');
        return (Number(seg[0] << 24) + Number(seg[1] << 16) + Number(seg[2] << 8) + Number(seg[3]));
      }

      return {
        ip2Int: ipToInt
      }
    }
  ])

  .factory('checkService', ['utilService',
    function(utilService) {
      var checkLoginUsernameValid = function(username) {
        var reg = /^[A-Za-z0-9\_]+$/;
        return reg.test(username);
      }

      var checkLoginPasswordValid = function(password) {
        var reg = /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\/]+$/;
        return reg.test(password);
      }

      var checkIp = function(ip) {
        var reg = /^(([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])$/;
        return reg.test(ip);
      }

      var checkIpValid = function(ip) {
        if (!checkIp(ip)) {
          return false;
        }

        /^(\d*)/.test(ip);
        var first = Number(RegExp.$1);
        // loopback and class D(multicast) ip is not valid
        if (first === 127 || (first >= 224 && first <= 239)) { return false; }
        return true;
      }

      var checkMask = function(netmask) {
        var pattern_mask = /^[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}\.{1}[0-9]{1,3}$/;
        if(!pattern_mask.test(netmask)){
          return false;
        };
        var sub_array = netmask.split('.');
        for(i = 0; i < 4; i++){
          if (sub_array[i] < 0 || sub_array[i] > 255){
            return false;
          };
        };
        var find_zero = false;
        var intIp = parseInt(parseInt(parseInt(sub_array[0])<<24) + parseInt(parseInt(sub_array[1])<<16) + parseInt(parseInt(sub_array[2])<<8) + parseInt(sub_array[3]));
        for(i= 0; i < 32; ++i){
          var flag = 1<<(31-i);
          if(parseInt(intIp & flag) == parseInt(0)){
            find_zero = true;
          }else{
            if(find_zero == true){
              return false;
            };
          };
        };
        if(!this.allowAllZero){
          if((parseInt(sub_array[0],10) == 0) &&(parseInt(sub_array[1],10) == 0) &&(parseInt(sub_array[2],10) == 0) &&(parseInt(sub_array[3],10) == 0)){
            return false;
          };
        };
        return true;
      }

      var checkIpMaskValid = function(ip, mask) {
        ip = utilService.ip2Int(ip);
        mask = utilService.ip2Int(mask);

        if (0x0 == (ip & mask) || mask == (ip & mask)) {
          return false;
        }
        if (0x0 == (ip & (~mask)) || (~mask) == (ip & (~mask))) {
          return false;
        }
        return true;
      }

      var checkSsidValid = function(ssid) {
        if (!ssid || ssid.length > 32) {
          return false;
        }
        var reg = /^[\x20-\x7e]+$/g;
        return reg.test(ssid);
      }

      var checkKeyValid = function(key) {
        if (!key || key.length > 63 || key.length < 8) {
          return false;
        }
        var reg = /^[A-Za-z0-9\`\~\!\@\#\$\&\*\(\)\-\=\_\+\[\]\{\}\;\:\'\"\\\|\/\?\.\,\<\>\%\^\ ]+$/;
        return reg.test(key);
      }

      return {
        isValidUsername: checkLoginUsernameValid,
        isValidPassword: checkLoginPasswordValid,
        isIp: checkIp,
        isValidIp: checkIpValid,
        isMask: checkMask,
        isIpInMask: checkIpMaskValid,
        isValidSsid: checkSsidValid,
        isValidKey: checkKeyValid
      }
    }
  ])

  .factory('promptService', ['$timeout', '$ionicPopup', 'serviceConstant', '$ionicLoading', 'toastr',
    function($timeout, $ionicPopup, serviceConstant, $ionicLoading, toastr) {
      var alert = function(message, title, callback) {
        $ionicPopup.alert({
          title: title,
          cssClass: title == undefined ? 'hide-popup-title' : '',
          template: message,
          okText: serviceConstant.STR.COMMON.BUTTON.OK
        }, callback);
      }

      var alertWithOptions = function(opts, callback) {
        $ionicPopup.alert(opts).then(function(isOk) {
          if (typeof callback == 'function') {
            callback(isOk);
          }
        });
      }

      var confirm = function(message, title, callback) {
        $ionicPopup.confirm({
          title: title,
          cssClass: title == undefined ? 'hide-popup-title' : '',
          template: message,
          okText: serviceConstant.STR.COMMON.BUTTON.OK,
          cancelText: serviceConstant.STR.COMMON.BUTTON.CANCEL
        }, callback);
      }

      var confirmWithOptions = function(opts, callback) {
        $ionicPopup.confirm(opts).then(function(isOk) {
          if (typeof callback == 'function') {
            callback(isOk);
          }
        });
      }

      var prompt = function(message, title, callback, inputType, inputPlaceholder) {
        $ionicPopup.prompt({
          title: title,
          cssClass: title == undefined ? 'hide-popup-title' : '',
          template: message,
          okText: serviceConstant.STR.COMMON.BUTTON.OK,
          cancelText: serviceConstant.STR.COMMON.BUTTON.CANCEL,
          inputType: inputType,
          inputPlaceholder: inputPlaceholder
        }, callback);
      }

      var promptWithOptions = function(opts, callback) {
        $ionicPopup.prompt(opts).then(function(input) {
          if (typeof callback == 'function') {
            callback(input);
          }
        });
      }

      var loadingShowWithOptions = function(opts) {
        $ionicLoading.show(opts);
      }

      var loadingShow = function(message, duration) {
        var template = "<ion-spinner></ion-spinner><br/>";
        if (message != undefined) {
          template += message;
        }
        loadingShowWithOptions({
          template: template,
          duration: duration
        });
      }

      var loadingHide = function(delay) {
        var d = 200;
        if (typeof delay == 'number' && delay >= 0) {
          d = delay;
        }
        $timeout($ionicLoading.hide, d);
      }

      var toastSuccess = function(message, title, duration) {
        if (!duration || typeof duration != 'number') {
          duration = 2000;
        }
        toastr.success(message, title, {
          timeOut: duration
        });
      }

      var toastInfo = function(message, title, duration) {
        if (!duration || typeof duration != 'number') {
          duration = 2000;
        }
        toastr.info(message, title, {
          timeOut: duration
        });
      }

      var toastWarning = function(message, title, duration) {
        if (!duration || typeof duration != 'number') {
          duration = 2000;
        }
        toastr.warning(message, title, {
          timeOut: duration
        });
      }

      var toastError = function(message, title, duration) {
        if (!duration || typeof duration != 'number') {
          duration = 2000;
        }
        toastr.error(message, title, {
          timeOut: duration
        });
      }

      return {
        alert: alert,
        alertWithOptions: alertWithOptions,
        confirm: confirm,
        confirmWithOptions: confirmWithOptions,
        prompt: prompt,
        promptWithOptions: promptWithOptions,
        loading: {
          showWithOptions: loadingShowWithOptions,
          show: loadingShow,
          hide: loadingHide
        },
        toast: {
          success: toastSuccess,
          info: toastInfo,
          warning: toastWarning,
          error: toastError
        }
      }
    }
  ])

  .factory('httpService', ['$http', 
    function($http) {
      var get = function(url, config, successCallback, failCallback) {
        $http.get(url, config)
          .then(function(response) {
            if (angular.isString(response)) {
              response = angular.fromJson(response);
            }
            if (angular.isFunction(successCallback)) {
              successCallback(response.data);
            }
          }, function(e) {
            if (angular.isString(e)) {
              e = angular.fromJson(e);
            }
            if (angular.isFunction(failCallback)) {
              failCallback(e.data);
            }
          });
      }

      var post = function(url, data, config, successCallback, failCallback) {
        if (angular.isObject(data)) {
          data = angular.toJson(data);
        } else {
          data = '' + data;
        }

        $http.post(url, data, config)
          .then(function(response) {
            if (angular.isString(response)) {
              response = angular.fromJson(response);
            }
            if (angular.isFunction(successCallback)) {
              successCallback(response.data);
            }
          }, function(e) {
            if (angular.isString(e)) {
              e = angular.fromJson(e);
            }
            if (angular.isFunction(failCallback)) {
              failCallback(e.data);
            }
          });
      }

      return {
        get: get,
        post: post
      }
    }
  ])

  .factory('dataService', ['httpService', 'authInfoService', 'serviceValue', 'serviceConstant',
    function(httpService, authInfoService, serviceValue, serviceConstant) {

      var request = function(opts) {
        var stok = authInfoService.getStok('stok');
        var href = serviceValue.serverProtocol + '//' + serviceValue.serverIp;

        if (opts.url) {
          var url = opts.url;
        } else {
          if (!stok) {
            url = href;
          } else {
            url = href + '/stok=' + stok + '/ds';
          }
        }

        var config = {
          method: 'POST',
          timeout: 20 * 1000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };

        if (opts.timeout && angular.isNumber(opts.timeout)) {
          config.timeout = opts.timeout;
        }

        httpService.post(url, opts.data, config, opts.success, opts.failure);
      }

      var showErrMsg = function(response) {
        if (!response) {
          cpeService.promptService.toast.error(cpeService.serviceConstant.STR.COMMON.ALERT.UNKNOWNERR);
        } else  if (response && response.error_code != 0) {
          var errorCode = response.error_code.toString().slice(1);
          var errorMsg = cpeService.serviceConstant.STR.COMMON.ERRORCODE['e' + errorCode];
          if (!errorMsg) {
            errorMsg = cpeService.serviceConstant.STR.COMMON.ERRORCODE.DEFAULT;
          }
          cpeService.promptService.toast.error(errorMsg);
        }
      }

      return {
        request: request,
        showErrMsg: showErrMsg
      }
    }
  ])

  .factory('authService', ['dataService', 'authInfoService', 'serviceConstant', 'serviceValue',
    function(dataService, authInfoService, serviceConstant, serviceValue) {

      var securityEncode = function(input1, input2, input3) {
        var dictionary = input3;
        var output = "";
        var len, len1, len2, lenDict;
        var cl = 0xBB, cr = 0xBB;

        len1 = input1.length;
        len2 = input2.length;
        lenDict = dictionary.length;
        len = len1 > len2 ? len1 : len2;

        for (var index = 0; index < len; index++) {
          cl = 0xBB;
          cr = 0xBB;

          if (index >= len1) {
            cr = input2.charCodeAt(index);
          } else if (index >= len2) {
            cl = input1.charCodeAt(index);
          } else {
            cl = input1.charCodeAt(index);
            cr = input2.charCodeAt(index);
          }

          output += dictionary.charAt((cl ^ cr)%lenDict);
        }

        return output;
      }

      var orgAuthPwd = function(pwd) {
        var strDe= 'RDpbLfCPsJZ7fiv';
        var dic = 'yLwVl0zKqws7LgKPRQ84Mdt708T1qQ3Ha7xv3H7NyU84p21BriUWBU43odz3iP4rBL3' +
        'cD02KZciXTysVXiV8ngg6vL48rPJyAUw0HurW20xqxv9aYb4M9wK1Ae0wlro510qXeU07' +
        'kV57fQMc8L6aLgMLwygtc0F10a0Dg70TOoouyFhdysuRMO51yY5ZlOZZLEal1h0t9YQW' +
        '0Ko7oBwmCAHoic4HYbUyVeU3sfQ1xtXcPcf1aT303wAQhv66qzW';
        return securityEncode(pwd, strDe, dic);
      }

      var getDeviceStatus = function() {
        dataService.request({
          url: getUrl(),
          data: {
            method: 'get',
            network: {
              name: 'sys'
            }
          },
          success: function(response) {
            // never reach here
          },
          failure: getDeviceStatusCallback
        });
      }

      var getDeviceStatusCallback = function(e) {
        if (!e) {
          return;
        }
        if (e.data && e.data.code && e.error_code == serviceConstant.AUTH_RESULT.AUTH_ERROR) {
          switch(e.data.code) {
            case serviceConstant.AUTH_RESULT.PASSWORD_ERROR:
              break;
            case serviceConstant.AUTH_RESULT.SESSION_TIMEOUT:
              serviceValue.isSessionTimeout = true;
              break;
            case serviceConstant.AUTH_RESULT.CLIENT_LOCKED:
              serviceValue.isLocked = true;
              break;
            case serviceConstant.AUTH_RESULT.FACTORY_STATUS:
              serviceValue.isFactory = true;
              break;
            case serviceConstant.AUTH_RESULT.EXECEED_MAX_CLIENT:
              break;
            case serviceConstant.AUTH_RESULT.OTHER_ERROR:
              break;
            case serviceConstant.AUTH_RESULT.SYSTEM_LOCKED:
              break;
            default:
              break;
          }
        }
        if (e.data && e.data.device_info && e.data.device_info.device_name) {
          document.title = e.data.device_info.device_name;
          cpeService.serviceValue.deviceName = e.data.device_info.device_name;
        }
      }

      var setSlpUrl = function(stok) {
        if (!stok) {
          serviceValue.slpUrl = serviceValue.serverProtocol + '//' + serviceValue.serverIp;
        } else {
          serviceValue.slpUrl = serviceValue.serverProtocol + '//' + serviceValue.serverIp + '/stok=' + stok + '/ds';
        }
      }

      var getSlpUrl = function() {
        return serviceValue.slpUrl;
      }

      var getUrl = function() {
        return serviceValue.serverProtocol + '//' + serviceValue.serverIp;
      }

      return {
        orgAuthPwd: orgAuthPwd,
        getDeviceStatus: getDeviceStatus,
        getDeviceStatusCallback: getDeviceStatusCallback,
        setSlpUrl: setSlpUrl,
        getSlpUrl: getSlpUrl,
        getUrl: getUrl
      }
    }
  ])

  .factory('localDataService', ['localStorageService', 
    function(localStorageService) {
      var get = function(key) {
        return localStorageService.get(key);
      }

      var set = function(key, val) {
        return localStorageService.set(key, val);
      }

      var remove = function(key) {
        return localStorageService.remove(key);
      }

      var clearAll = function() {
        return localStorageService.clearAll();
      }

      var getCookie = function(key) {
        if (localStorageService.cookie.isSupported) {
          return localStorageService.cookie.get(key);
        }
      }

      var setCookie = function(key, val) {
        if (localStorageService.cookie.isSupported) {
          return localStorageService.cookie.set(key, val);
        }
      }

      var removeCookie = function(key) {
        if (localStorageService.cookie.isSupported) {
          return localStorageService.cookie.remove(key);
        }
      }

      var clearAllCookie = function() {
        if (localStorageService.cookie.isSupported) {
          return localStorageService.cookie.clearAll();
        }
      }

      return {
        get: get,
        set: set,
        remove: remove,
        clearAll: clearAll,
        getCookie: getCookie,
        setCookie: setCookie,
        removeCookie: removeCookie,
        clearAllCookie: clearAllCookie
      }
    }
  ])

  .factory('authInfoService', ['serviceValue', 'localDataService', 
    function(serviceValue, localDataService) {
      var markLogin = function(isLogin) {
        serviceValue.isLogin = isLogin ? true : false;
      }

      var isLogin = function() {
        return serviceValue.isLogin ? true : false;
      }

      var getStok = function() {
        return localDataService.getCookie('stok');
      }

      var setStok = function(stok) {
        return localDataService.setCookie('stok', stok);
      }

      var removeStok = function() {
        return localDataService.removeCookie('stok');
      }

      return {
        markLogin: markLogin,
        isLogin: isLogin,
        getStok: getStok,
        setStok: setStok,
        removeStok: removeStok
      }
    }
  ])

  .factory('transformService', ['serviceValue',
    function(serviceValue) {
      var getWirelessModeIndex = function(modeStr) {
        var modeIndex;
        if (!modeStr) {
          return;
        }

        switch(modeStr) {
          case '11b':
            modeIndex = 0;
            break;
          case '11g':
            modeIndex = 1;
            break;
          case '11bg mixed':
            modeIndex = 2;
            break;
          case '11n':
            modeIndex = 3;
            break;
          case '11bgn mixed':
            modeIndex = 4;
            break;
          case '11a':
            modeIndex = 5;
            break;
          case '11g_5g':
            modeIndex = 6;
            break;
          case '11a/n mixed':
            modeIndex = 7;
            break;
          case '11a/n/ac mixed':
            modeIndex = 8;
            break;
        }

        return modeIndex;
      }

      var getWirelessChannelIndex = function(channnelStr) {
        var channelIndex;
        if (!channnelStr) {
          return;
        }

        if (parseInt(channnelStr) && parseInt(channnelStr) <= 13) {
          // channel 1-13
          channelIndex = parseInt(channnelStr);
        } else {
          switch(channnelStr) {
            case 'auto':
              channelIndex = 0;
              break;
            case '36':
              channelIndex = 14;
              break;
            case '40':
              channelIndex = 15;
              break;
            case '44':
              channelIndex = 16;
              break;
            case '48':
              channelIndex = 17;
              break;
            case '149':
              channelIndex = 18;
              break;
            case '153':
              channelIndex = 19;
              break;
            case '157':
              channelIndex = 20;
              break;
            case '161':
              channelIndex = 21;
              break;
            case '165':
              channelIndex = 22;
              break;
          }

          return channelIndex;
        }
      }

      var getWirelessBandwidthIndex = function(bandwidthStr) {
        var bandwidthIndex;
        if (!bandwidthStr) {
          return;
        }

        switch(bandwidthStr) {
          case 'auto':
            bandwidthIndex = 0;
            break;
          case '20MHz':
            bandwidthIndex = 1;
            break;
          case '40MHz':
            bandwidthIndex = 2;
            break;
          case '80MHz':
            bandwidthIndex = 3;
            break;   
        }

        return bandwidthIndex;
      }

      return {
        getWirelessModeIndex: getWirelessModeIndex,
        getWirelessChannelIndex: getWirelessChannelIndex,
        getWirelessBandwidthIndex: getWirelessBandwidthIndex
      }
    }
  ])

  .factory('cpeService', ['$rootScope', '$window', 'serviceConstant', 'serviceValue', 'checkService', 'promptService', 'httpService', 'dataService', 'authService', 'localDataService', 'authInfoService', 'transformService',
    function($rootScope, $window, serviceConstant, serviceValue, checkService, promptService, httpService, dataService, authService, localDataService, authInfoService, transformService) {
      var services = {
        serviceConstant: serviceConstant,
        serviceValue: serviceValue,
        checkService: checkService,
        promptService: promptService,
        httpService: httpService,
        dataService: dataService,
        authService: authService,
        localDataService: localDataService,
        authInfoService: authInfoService,
        transformService: transformService
      }

      $rootScope.cpeService = services;
      $window.cpeService = services;

      return services;
    }
  ]);
