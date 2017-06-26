'use strict';

angular.module('cpe-phone.controllers', ['cpe-phone.services', 'ui.router'])

.factory('controllerUtil', ['cpeService', '$state',
	function(cpeService, $state) {
		var submitData = function(data, callback) {
			cpeService.dataService.request({
				timeout: 30 * 1000,
				data: data,
				success: function(response) {
					cpeService.promptService.loading.hide();
					if (!response || response.error_code != 0) {
						cpeService.dataService.showErrMsg(response);
						return;
					}
					if (callback && typeof callback == 'function') {
						callback();
						return;
					}
					cpeService.promptService.loading.hide();
					$state.go('finish');
				},
				failure: function(e) {
					cpeService.promptService.loading.hide();
					cpeService.dataService.showErrMsg();
				}
			});
		}

		return {
			submitData: submitData
		}
	}
])

.controller('loginCtrl', ['cpeService', '$scope', '$window', '$state', '$rootScope',
	function(cpeService, $scope, $window, $state, $rootScope) {
		$scope.$on('$ionicView.beforeEnter', beforeEnterCallback);
		$rootScope.$on('$ionicView.beforeEnter', function(ev, data) {
			// This event firing everytime a new view is shown
			// Here we stop changing document title from deviceName to view title
			// Always set deviceName as document title
			var deviceName = cpeService.localDataService.get('device_name');
			if (deviceName) {
				cpeService.serviceValue.deviceName = deviceName;
				document.title = cpeService.serviceValue.deviceName;
			}
		});
		$scope.data = {
			local: {
				str: {
					title: '欢迎使用',
					inputUsername: '请输入用户名',
					inputPassword: '输入密码',
					setUsername: '请设置用户名',
					setPassword: '设置密码',
					managePassword: '管理密码',
					managepwdPlaceholder: '可在设备标贴上查看',
					changePassword: '修改密码',
					confirm: '确定',
					signIn: '登录',
					required: '此项为必填项',
					usernameBlank: '用户名不能为空，请重新输入',
					passwordBlank: '密码不能为空，请重新输入',
					invalidUsername: '用户名应该只包含字母、数字、"@"、"_"、"-"或"."',
					invalidPassword: '密码中存在非法字符，请重新输入',
					usernameLength: '用户名长度不能超过31位',
					passwordLength: '请输入6-15位字符',
					usernamePwdErr: '输入错误10次将被锁定，剩余尝试次数：'
				},
				inputType: 'password',
				eyecls: '',
				attempLoginTimesLeft: 10
			}
		}

		function beforeEnterCallback() {
			$scope.data.local.isLoading = true;
			cpeService.dataService.getDeviceStatus(deviceHackCallback);
		}

		function deviceHackCallback() {
			if (top.location.href.indexOf('tplogin') != -1) {
				$state.go('domainlist');
				return;
			}
			if (!cpeService.serviceValue.isFactory) {
				$scope.data.local.str.managepwdPlaceholder = $scope.data.local.str.inputPassword;
			}

			// try auto login
			var username = cpeService.authInfoService.getUsername();
			var password = cpeService.authInfoService.getPassword();
			if (username && password && !cpeService.serviceValue.isFactory) {
				$scope.action.signIn(username, password);
			} else {
				$scope.data.local.isLoading = false;
			}
		}

		$scope.action = {
			showPassword: function() {
				if ($scope.data.local.inputType == 'password') {
					$scope.data.local.inputType = 'text';
					$scope.data.local.eyecls = 'positive';
				} else {
					$scope.data.local.inputType = 'password';
					$scope.data.local.eyecls = '';
				}
			},

			signUp: function() {
				var username = $scope.data.local.username;
				var password = cpeService.authService.orgAuthPwd($scope.data.local.password);
				var url = cpeService.authService.getUrl();

				// Set username and password
				var data = {
					method: 'do',
					set_password: {
						username: username,
						password: password,
						level: '1'
					}
				};

				cpeService.promptService.loading.show();
				cpeService.dataService.request({
					jumpAuth: true,
					url: url,
					data: data,
					success: function(response) {
						cpeService.promptService.loading.hide();
						if (!response || response.error_code != 0) {
							cpeService.dataService.showErrMsg(response);
							return;
						}
						if (response.stok) {
							cpeService.authService.setSlpUrl(response.stok);
							cpeService.authInfoService.setStok(response.stok);
						}
						cpeService.serviceValue.isFactory = false;
						cpeService.authInfoService.markLogin(true);
						cpeService.authInfoService.setUsername(username);
						cpeService.authInfoService.setPassword(password);
						$state.go('opmode');
					},
					failure: function(e) {
						cpeService.promptService.loading.hide();
						cpeService.dataService.showErrMsg(e);
						cpeService.localDataService.clearAll();
						cpeService.localDataService.clearAllCookie();
					}
				});
			},

			signIn: function(username, password) {
				if (!username || !password) {
					var username = $scope.data.local.username;
					if (cpeService.localDataService.get('is_monitor_suite')) {
						username = 'admin';
					}
					var password = cpeService.authService.orgAuthPwd($scope.data.local.password);
				}

				var data = {
					method: 'do',
					login: {
						username: username,
						password: password
					}
				};

				cpeService.promptService.loading.show();
				cpeService.dataService.request({
					jumpAuth: true,
					url: cpeService.authService.getUrl(),
					data: data,
					success: function(response) {
						cpeService.promptService.loading.hide();
						if (response.error_code == 0 && response.stok) {
							cpeService.authInfoService.markLogin(true);
							cpeService.authInfoService.setStok(response.stok);
							cpeService.authInfoService.setUsername(username);
							cpeService.authInfoService.setPassword(password);
							cpeService.authService.setSlpUrl(response.stok);
							$state.go('finish');
						} else {
							// show login input form
							$scope.data.local.isLoading = false;
							cpeService.localDataService.clearAll();
							cpeService.localDataService.clearAllCookie();
							cpeService.authService.setSlpUrl();
							cpeService.dataService.showErrMsg(e);
						}
					},
					failure: function(e) {
						cpeService.promptService.loading.hide();
						// show login input form
						$scope.data.local.isLoading = false;
						if (!e) {
							cpeService.promptService.toast.error(cpeService.serviceConstant.STR.COMMON.ALERT.UNKNOWNERR);
							return;
						}
						if (e.data && typeof e.data.time == 'number') {
							$scope.data.local.attempLoginTimesLeft = e.data.time;
						}
						var errorMsg;
						if (e.data && e.data.code) {
							switch(e.data.code) {
								case cpeService.serviceConstant.AUTH_RESULT.PASSWORD_ERROR:
									errorMsg = cpeService.serviceConstant.STR.LOGIN.ALERT.WRONGUSERNAMEPWD;
									if (cpeService.localDataService.get('is_monitor_suite')) {
										errorMsg = cpeService.serviceConstant.STR.LOGIN.ALERT.WRONGPASSWORD;
									}
									break;
								case cpeService.serviceConstant.AUTH_RESULT.SESSION_TIMEOUT:
									cpeService.serviceValue.isSessionTimeout= true;
									errorMsg = cpeService.serviceConstant.STR.LOGIN.ALERT.SESSIONTIMEOUT;
									break;
								case cpeService.serviceConstant.AUTH_RESULT.CLIENT_LOCKED:
									cpeService.serviceValue.isLocked = true;
									errorMsg = cpeService.serviceConstant.STR.LOGIN.ALERT.CLIENTLOCKED;
									break;
								default:
									errorMsg = cpeService.serviceConstant.STR.COMMON.ALERT.UNKNOWNERR;
									break;
							}
						}
						cpeService.promptService.toast.error(errorMsg);
						cpeService.localDataService.clearAll();
						cpeService.localDataService.clearAllCookie();
					}
				});
			},

			goChangePwd: function() {
				$state.go('changepwd');
			}
		}
	}
])

.controller('changepwdCtrl', ['cpeService', '$scope', '$state', '$rootScope',
	function(cpeService, $scope, $state, $rootScope) {
		$scope.data = {
			local: {
				str: {
					title: '修改密码',
					oldpwd: '旧密码',
					oldpwdPlaceholder: '输入旧密码',
					oldpwdBlank: '旧密码不能为空，请重新输入',
					newpwd: '新密码',
					newpwdPlaceholder: '输入新密码',
					newpwdBlank: '新密码不能为空，请重新输入',
					confirmpwd: '确认密码',
					confirmpwdPlaceholder: '再次输入新密码',
					passwordNotSame: '两次密码输入不一致',
					passwordLength: '请输入6-15位字符',
					invalidPassword: '密码中存在非法字符，请重新输入',
					passwordError: '输入错误10次将被锁定，剩余尝试次数：',
					confirm: '确认'
				}
			},
			attempLoginTimesLeft: 10
		}

		$scope.action = {
			changePassword: function() {
				// first do login, then change password
				var username = 'admin';
				var oldpwd = cpeService.authService.orgAuthPwd($scope.data.local.oldpwd);
				var newpwd = cpeService.authService.orgAuthPwd($scope.data.local.newpwd);
				var loginData = {
					method: 'do',
					login: {
						username: username,
						password: oldpwd
					}
				};
				var changePwdData = {
					method: 'do',
					system: {
						chg_pwd: {
							old_user: username,
							new_user: username,
							old_pwd: oldpwd,
							new_pwd: newpwd
						}
					}
				};
				cpeService.promptService.loading.show();
				cpeService.dataService.request({
					jumpAuth: true,
					url: cpeService.authService.getUrl(),
					data: loginData,
					success: function(response) {
						if (!response || response.error_code != 0) {
							cpeService.promptService.loading.hide();
							cpeService.dataService.showErrMsg(response);
							cpeService.localDataService.clearAll();
							cpeService.localDataService.clearAllCookie();
							return;
						}
						if (response.stok) {
							cpeService.authInfoService.setStok(response.stok);
							cpeService.authService.setSlpUrl(response.stok);
							// change password
							cpeService.dataService.request({
								data: changePwdData,
								success: function(response) {
									cpeService.promptService.loading.hide();
									if (!response || response.error_code != 0) {
										cpeService.dataService.showErrMsg(response);
										cpeService.localDataService.clearAll();
										cpeService.localDataService.clearAllCookie();
										return;
									}
									cpeService.promptService.toast.success(cpeService.serviceConstant.STR.COMMON.ALERT.SUCCESS);
									cpeService.authInfoService.markLogin(true);
									cpeService.authInfoService.setUsername(username);
									cpeService.authInfoService.setPassword(newpwd);
									$state.go('finish');
								},
								failure: function(e) {
									cpeService.promptService.loading.hide();
									cpeService.dataService.showErrMsg(e);
									cpeService.localDataService.clearAll();
									cpeService.localDataService.clearAllCookie();
								}
							});
						}
					},
					failure: function(e) {
						cpeService.promptService.loading.hide();
						if (!e) {
							cpeService.promptService.toast.error(cpeService.serviceConstant.STR.COMMON.ALERT.UNKNOWNERR);
							return;
						}
						if (e.data && typeof e.data.time == 'number') {
							$scope.data.local.attempLoginTimesLeft = e.data.time;
						}
						var errorMsg;
						if (e.data && e.data.code) {
							switch(e.data.code) {
								case cpeService.serviceConstant.AUTH_RESULT.PASSWORD_ERROR:
									errorMsg = cpeService.serviceConstant.STR.CHANGEPWD.ALERT.WRONGPASSWORD;
									break;
								case cpeService.serviceConstant.AUTH_RESULT.SESSION_TIMEOUT:
									cpeService.serviceValue.isSessionTimeout= true;
									errorMsg = cpeService.serviceConstant.STR.CHANGEPWD.ALERT.SESSIONTIMEOUT;
									break;
								case cpeService.serviceConstant.AUTH_RESULT.CLIENT_LOCKED:
									cpeService.serviceValue.isLocked = true;
									errorMsg = cpeService.serviceConstant.STR.CHANGEPWD.ALERT.CLIENTLOCKED;
									break;
								default:
									errorMsg = cpeService.serviceConstant.STR.COMMON.ALERT.UNKNOWNERR;
									break;
							}
						}
						cpeService.promptService.toast.error(errorMsg);
						cpeService.localDataService.clearAll();
						cpeService.localDataService.clearAllCookie();
					}
				});
			}
		}
	}
])

.controller('domainlistCtrl', ['cpeService', '$scope', '$state', '$rootScope',
	function(cpeService, $scope, $state, $rootScope) {
		$scope.$on('$ionicView.beforeEnter', beforeEnterCallback);
		$scope.data = {
			local: {
				str: {
					title: '设备列表',
					recorder: '录像机端',
					camera: '摄像头端',
					selectDomain: '请选择要登录的设备',
					mac: 'MAC: ',
					ip: 'IP: '
				}
			}
		}

		function beforeEnterCallback() {
			if (cpeService.localDataService.get('is_monitor_suite')) {
				$scope.data.local.isMonitorSuite = true;
				$scope.data.local.recorderList = [];
				$scope.data.local.cameraList = [];
			} else {
				$scope.data.local.isMonitorSuite = false;
				$scope.data.local.domainList = [];
			}
			cpeService.dataService.getDomainList(getDomainListCallback);
		}

		function getDomainListCallback() {
			reBuildDomainList(cpeService.serviceValue.domainList);
			$scope.data.local.isFreshing = false;
		}

		function reBuildDomainList(rawList) {
			var arr = new Array();
			for (var i in rawList) {
				var itemName = "domain_array_" + (parseInt(i) + 1);
				var domainItem = rawList[i][itemName];
				arr.push(domainItem);
			}
			$scope.data.local.domainList = arr;
			if ($scope.data.local.isMonitorSuite) {
				for (var i in arr) {
					if (arr[i].mode && arr[i].mode == 1) {
						// recorder mode
						$scope.data.local.recorderList.push(arr[i]);
					}
					if (arr[i].mode && arr[i].mode == 2) {
						// camera mode
						$scope.data.local.cameraList.push(arr[i]);
					}
				}
			}
		}

		$scope.action = {
			refreshDomainList: function() {
				$scope.data.local.isFreshing = true;
				$scope.data.local.domainList = [];
				$scope.data.local.recorderList = [];
				$scope.data.local.cameraList = [];
				cpeService.dataService.getDomainList(getDomainListCallback);
			},

			goToDomain: function(domain) {
				var protocol = top.location.protocol;
				if (domain.ip && cpeService.checkService.isValidIp(domain.ip)) {
					top.location = protocol + '//' + domain.ip;
				}
			}
		}
	}
])

.controller('opmodeCtrl', ['cpeService', '$scope', '$state', '$rootScope',
	function(cpeService, $scope, $state, $rootScope) {
		$scope.$on('$ionicView.beforeEnter', beforeEnterCallback);
		if (!cpeService.localDataService.get('is_monitor_suite')) {
			$scope.data = {
				local: {
					str: {
						step1: '1/2 选择工作模式',
						opmodeEntry: '了解两种模式 >',
						opmodeIntro: '<h4>Access Point 模式</h4>设备作为不同无线局域网客户端的中心节点。<br/><h4>Client 模式</h4>有线设备可以接入Client，而Client可以作为一个无线适配器接收来自无线网络的信号。',
						nextStep: '下一步'
					},
					opmodes: [{
						name: 'Access Point 模式', value: '1'
					}, {
						name: 'Client 模式', value: '2'
					}]
				}
			}
		} else {
			$scope.data = {
				local: {
					str: {
						step1: '1/2 选择工作模式',
						opmodeEntry: '了解两种模式 >',
						opmodeIntro: '<h4>录像机端</h4>用于连接视频监控网络中的NVR录像机。<br/><h4>摄像头端</h4>用于连接视频监控网络中的IPC摄像头。',
						nextStep: '下一步'
					},
					opmodes: [{
						name: '录像机端', value: '1'
					}, {
						name: '摄像头端', value: '2'
					}]
				}
			}
		}

		function beforeEnterCallback() {
			cpeService.dataService.request({
				data: {
					method: 'get',
					opmode: {
						name: 'op'
					}
				},
				success: function(response) {
					if (!response || response.error_code != 0) {
						cpeService.dataService.showErrMsg(response);
						$scope.data.local.opmode = $scope.data.local.opmodes[0];
						return;
					}
					$scope.data.local.opmode = $scope.data.local.opmodes[parseInt(response.opmode.op.old_mode) - 1];
					cpeService.localDataService.set('old_mode', response.opmode.op.old_mode);
				},
				failure: function(e) {
					cpeService.dataService.showErrMsg(e);
					$scope.data.local.opmode = $scope.data.local.opmodes[0];
				}
			});
		}

		$scope.action = {
			showOpmodeIntro: function() {
				cpeService.promptService.alert($scope.data.local.str.opmodeIntro, undefined);
			},
			goToNext: function() {
				if ($scope.data.local.opmode.value == 1) {
					cpeService.localDataService.set('new_mode', '1');
					$state.go('ap');
				} else if ($scope.data.local.opmode.value == 2) {
					cpeService.localDataService.set('new_mode', '2');
					$state.go('client');
				}
			}
		}
	}
])

.controller('apCtrl', ['$scope', '$rootScope', '$state', 'cpeService', '$interval', 'controllerUtil',
	function($scope, $rootScope, $state, cpeService, $interval, controllerUtil) {
		$scope.$on('$ionicView.beforeEnter', beforeEnterCallback);
		$scope.data = {
			local: {
				str: {
					step3: '2/2 AP 设置',
					ssidInput: 'SSID',
					ssidBlank: 'SSID不能为空',
					wirelessModeInput: '无线模式',
					encryptionInput: '加密方式',
					keyInput: '无线密码',
					spectrumAnalysis: '频谱分析',
					scrollTip: '向右滑动查看完整频谱分析>',
					peak: '峰值',
					average: '平均值',
					current: '当前值',
					dbm: '功率(dBm)',
					channelInput: '无线信道',
					bandwidthInput: '无线带宽',
					nextStep: '下一步',
					required: '此项为必填项',
					invalidSsid: 'SSID超过合法长度',
					ssidLength: 'SSID长度不能超过32位',
					invalidKey: '密码中存在非法字符，请重新输入8 - 63位的ASCII码字符串',
					keyBlank: '无线密码不能为空',
					keyLength: '请输入8 - 63位字符串',
					isSetting: '正在设置CPE...'
				},
				inputType: 'password',
				eyecls: '',
				spectrum: {
					data: [],
					range: ['5', '6'],
					labels: [],
					options: {
						spanGaps: true,
						scales: {
							xAxes: [{
								position: 'bottom',
								display: true,
								labelString: 'bandwidth',
								scaleLabel: {
									display: true
								},
								ticks: {
									beginAtZero: true,
									stepSize: 1,
									min: 0,
									max: 44,
									callback: function(value, index, values) {
										var str;
										if (index == 4) {
											str = '36';
										} else if (index == 8) {
											str = '40';
										} else if (index == 12) {
											str = '44';
										} else if (index == 16) {
											str = '48';
										} else if (index == 24) {
											str = '149';
										} else if (index == 28) {
											str = '153';
										} else if (index == 32) {
											str = '157';
										} else if (index == 36) {
											str = '161';
										} else if (index == 40) {
											str = '165';
										}
										return str;
									}
								}
							}],
							yAxes: [{
								id: 'y-axis-1',
								type: 'linear',
								display: true,
								position: 'left'
							}, {
								id: 'y-axis-2',
								type: 'linear',
								display: false,
								position: 'left'
							}, {
								id: 'y-axis-3',
								type: 'linear',
								display: false,
								position: 'left'
							}]
						}
					},
					count: 0
				}
			}
		}

		if (cpeService.localDataService.get('is_monitor_suite')) {
			$scope.data.local.str.step3 = '2/2 无线设置';
			$scope.data.local.str.isSetting = '正在设置...';
		}

		for (var i = 0;i < 44; i++) {
			$scope.data.local.spectrum.labels.push(i + 1);
		}
		$scope.data.local.spectrum.series = [$scope.data.local.str.peak, $scope.data.local.str.average, $scope.data.local.str.current];
		$scope.data.local.spectrum.datasetOverride = [{
			fill: true,
			pointRadius: 0,
			backgroundColor: 'transparent',
			borderWidth: 1,
			lineTension: 0,
			pointBorderWidth: 0,
			PointHitRadius: 0,
			PointBackgroundColor: '#ff645d',
			PointBorderColor: 'transparent'
		}, {
			fill: true,
			pointRadius: 1,
			backgroundColor: 'transparent',
			borderWidth: 1,
			lineTension: 0,
			pointBorderWidth: 0,
			PointHitRadius: 0,
			PointBackgroundColor: '#a049cc',
			PointBorderColor: 'transparent'
		}, {
			fill: true,
			pointRadius: 1,
			backgroundColor: 'transparent',
			borderWidth: 1,
			lineTension: 0,
			pointBorderWidth: 0,
			PointHitRadius: 0,
			PointBackgroundColor: '#5265ff',
			PointBorderColor: 'transparent'
		}];

		function startSpectrumAnalysis(range) {
			cpeService.dataService.request({
				data: {
					method: 'set',
					spectrum: {
						spectrum_start: {
							range: range
						}
					}
				},
				success: function(response) {
					if (!response || response.error_code != 0) {
						// alert error
						if ($scope.data.local.spectrum.getSpectrumDataTimer) {
							$interval.cancel($scope.data.local.getSpectrumDataTimer);
						}
						return;
					}
					$scope.data.local.spectrum.getSpectrumDataTimer = $interval(getSpectrumAnalysisData, 1000);
				}
			});
		}

		function getSpectrumAnalysisData() {
			cpeService.dataService.request({
				data: {
					method: 'do',
					spectrum: {
						spectrum_get_result: {
							range: '5'
						}
					}
				},
				success: function(response) {
					if (!response || response.error_code != 0) {
						// alert error
						if ($scope.data.local.spectrum.getSpectrumDataTimer) {
							$interval.cancel($scope.data.local.spectrum.getSpectrumDataTimer);
						}
						return;
					}
					$scope.data.local.spectrum.count ++;
					if ($scope.data.local.spectrum.count > 20) {
						$interval.cancel($scope.data.local.spectrum.getSpectrumDataTimer);
						$scope.data.local.spectrum.count = 0;
						return;
					}
					var current = response.current;
					var newCurrent = [];
					for (var i = 1; i < 320; i += 7) {
						newCurrent.push(current[i]);
					}
					var peak = response.peak;
					var newPeak = [];
					for (var i = 1; i < 320; i += 7) {
						newPeak.push(peak[i]);
					}
					var average = response.average;
					var newAverage = [];
					for (var i = 1; i < 320; i += 7) {
						newAverage.push(average[i]);
					}
					$scope.data.local.spectrum.data = [newPeak, newAverage, newCurrent];
					console.log($scope.data.local.spectrum.data);
				}
			});
		}

		function beforeEnterCallback() {
			cpeService.promptService.loading.show();
			cpeService.dataService.getModuleSpec(getHost5GData);
			// Do not fire spectrum analysis now, something about capbility still need discussing
			// startSpectrumAnalysis($scope.data.local.spectrum.range[0]);
		}

		function getHost5GData() {
			$scope.data.local.wirelessModes = cpeService.serviceValue.wireless5GModes;
			$scope.data.local.encryptions = cpeService.serviceConstant.encryptions;
			$scope.data.local.channels = cpeService.serviceValue.wireless5GChannels;
			$scope.data.local.bandwidths = cpeService.serviceValue.wireless5GBandwidths;
			cpeService.dataService.request({
				data: {
					method: 'get',
					wireless: {
						name: 'wlan_host_5g'
					}
				},
				success: function(response) {
					cpeService.promptService.loading.hide();
					if (!response || response.error_code != 0) {
						cpeService.dataService.showErrMsg(response);
						$scope.data.local.wirelessMode = $scope.data.local.wirelessModes[0];
						$scope.data.local.encryption = $scope.data.local.encryptions[0];
						$scope.data.local.channel = $scope.data.local.channels[0];
						$scope.data.local.bandwidth = $scope.data.local.bandwidths[0];
						$scope.action.changeModeOrChannel();
						$scope.action.changeBandwidth();
						return;
					}
					var wlan_host_5g = response.wireless.wlan_host_5g;
					$scope.data.local.ssid = decodeURIComponent(wlan_host_5g.ssid);
					$scope.data.local.key = typeof wlan_host_5g.key == 'undefined' ? '' : decodeURIComponent(wlan_host_5g.key);
					$scope.data.local.wirelessMode = cpeService.serviceConstant.wirelessModes[wlan_host_5g.mode];
					$scope.data.local.encryption = cpeService.serviceConstant.encryptions[wlan_host_5g.encryption];
					$scope.data.local.channel = cpeService.serviceConstant.channels[wlan_host_5g.channel];
					$scope.data.local.bandwidth = cpeService.serviceConstant.bandwidths[wlan_host_5g.bandwidth];
				},
				failure: function(e) {
					cpeService.promptService.loading.hide();
					cpeService.dataService.showErrMsg(e);
					$scope.data.local.wirelessMode = $scope.data.local.wirelessModes[0];
					$scope.data.local.encryption = $scope.data.local.encryptions[0];
					$scope.data.local.channel = $scope.data.local.channels[0];
					$scope.data.local.bandwidth = $scope.data.local.bandwidths[0];
					$scope.action.changeModeOrChannel();
					$scope.action.changeBandwidth();
				}
			});
		}

		$scope.action = {
			changeModeOrChannel: function() {
				if ($scope.data.local.wirelessMode.value == '5' || $scope.data.local.channel.value == '165') {
					// If mode is 11a or channel is 165, bandwidth must be 20
					$scope.data.local.bandwidths = [cpeService.serviceConstant.bandwidths[1]];
					$scope.data.local.bandwidth = $scope.data.local.bandwidths[0];
				} else if ($scope.data.local.wirelessMode.value == '6' || $scope.data.local.wirelessMode.value == '7') {
					// If mode is 11n_5g/11an, bw80 is unselectable
					$scope.data.local.bandwidths = cpeService.serviceConstant.bandwidths.slice(0,3);
				} else {
					$scope.data.local.bandwidths = cpeService.serviceValue.wireless5GBandwidths;
				}
			},
			changeBandwidth: function() {
				if ($scope.data.local.bandwidth.value == '3') {
					$scope.data.local.wirelessModes = cpeService.serviceConstant.wirelessModes.slice(8,9);
					$scope.data.local.wirelessMode = $scope.data.local.wirelessModes[0];
				} else {
					$scope.data.local.wirelessModes = cpeService.serviceValue.wireless5GModes;
				}
			},
			showPassword: function() {
				if ($scope.data.local.inputType == 'password') {
					$scope.data.local.inputType = 'text';
					$scope.data.local.eyecls = 'positive';
				} else {
					$scope.data.local.inputType = 'password';
					$scope.data.local.eyecls = ''
				}
			},
			goToNext: function() {
				var wlan_host_5g = {
					enable: '1',
					ssid: encodeURIComponent($scope.data.local.ssid),
					mode: $scope.data.local.wirelessMode.value,
					encryption: $scope.data.local.encryption.value,
					key: encodeURIComponent($scope.data.local.key),
					channel: $scope.data.local.channel.value,
					bandwidth: $scope.data.local.bandwidth.value
				}

				var requestData = {
					method: 'set',
					wireless: {
						wlan_host_5g: wlan_host_5g
					}
				};

				var oldMode = cpeService.localDataService.get('old_mode');
				var newMode = cpeService.localDataService.get('new_mode');

				if (oldMode && newMode && oldMode != newMode) {
					// if wds on, channel/bandwidth/mode cannot be set, so change opmode firstly
					var modeData = {
						method: 'set',
						opmode: {
							op: {
								old_mode: oldMode,
								new_mode: newMode
							}
						}
					};
					cpeService.promptService.loading.show($scope.data.local.str.isSetting);
					cpeService.dataService.request({
						data: modeData,
						success: function(response) {
							if (!response || response.error_code != 0) {
								cpeService.promptService.loading.hide();
								cpeService.dataService.showErrMsg(response);
								return;
							}
							controllerUtil.submitData(requestData);
						},
						failure: function(e) {
							cpeService.promptService.loading.hide();
							cpeService.dataService.showErrMsg(e);
						}
					});
				} else {
					cpeService.promptService.loading.show($scope.data.local.str.isSetting);
					controllerUtil.submitData(requestData);
				}
			}
		}
	}
])

.controller('clientCtrl', ['$scope', '$rootScope', '$state', 'cpeService', 'controllerUtil',
	function($scope, $rootScope, $state, cpeService, controllerUtil) {
		$scope.$on('$ionicView.beforeEnter', beforeEnterCallback);
		$scope.data = {
			local: {
				str: {
					step3: '2/2 Client 设置',
					selectNetwork: '请选择远程AP SSID',
					isScanning: '扫描中...',
					detail: '详情',
					packup: '收起',
					other: '其他',
					bssid: 'MAC 地址',
					snr: '信噪比(dB)',
					noise: '信号／噪声(dBm)',
					channel: '信道',
					ssidOfAp: '远程AP SSID',
					ssidOfApPlaceholder: '输入远程AP SSID',
					inputKey: '无线密码',
					encryption: '加密方式',
					select: '选择',
					nextStep: '下一步',
					required: '此项为必填项',
					invalidSsid: 'SSID超过合法长度',
					ssidOfApBlank: '远程AP SSID不能为空',
					ssidLength: 'SSID长度不能超过32位',
					invalidKey: '密码中存在非法字符，请重新输入8 - 63位的ASCII码字符串',
					keyLength: '请输入8 - 63位字符串',
					keyBlank: '无线密码不能为空',
					isSetting: '正在设置CPE...'
				},
				isScanning: true,
				isPackup: true,
				deviceDetailEntry: '详情',
				scanConnect: true,
				encryptions: cpeService.serviceConstant.encryptions,
				devices: [],
				inputType: 'password',
				eyecls: '',
				scan: {},
				input: {}
			}
		}

		if (cpeService.localDataService.get('is_monitor_suite')) {
			$scope.data.local.str.step3 = '2/2 无线连接';
			$scope.data.local.str.isSetting = '正在设置...';
		}

		function getScanList() {
			cpeService.dataService.request({
				timeout: 20 * 1000,
				data: {
					method: 'get',
					wireless: {
						name: 'wlan_scan_5g'
					}
				},
				success: function(response) {
					if (!response || response.error_code != 0) {
						// alert error
						cpeService.promptService.toast.error(cpeService.serviceConstant.STR.COMMON.ALERT.FAILGETDATA);
						return;
					}
					var scanList = response.wireless.wlan_scan_5g;
					$scope.data.local.devices = reBuildScanList(scanList);
					$scope.data.local.isScanning = false;
				}
			});
		}

		function reBuildScanList(rawList) {
			var newList = new Array();
			var ap;
			for (var item in rawList) {
				var device = rawList[item];
				ap = 'ap_' + (parseInt(item) + 1);
				newList.push(device[ap]);
			}
			for (var item in newList) {
				var device = newList[item];
				device.isPackup = true;
				device.deviceDetailEntry = $scope.data.local.str.detail;
				device.deviceName = decodeURIComponent(device.device_name);
				if (device.ssid) {
					device.ssid = decodeURIComponent(device.ssid);
				} else {
					// hidden ssid
					device.ssid = '';
				}
				device.bssid = decodeURIComponent(device.bssid);
				device.signalNoiseRatio = device.signal + '/' + device.noise;
				var channelIndex = cpeService.transformService.getWirelessChannelIndex(device.channel.toString());
				device.channelStr = cpeService.serviceConstant.channels[channelIndex].name;
				if (device.encryption == 0) {
					device.isEncrypted = false;
				} else {
					device.encryptionStr = cpeService.serviceConstant.encryptions[1].name;
					device.isEncrypted = true;
				}
			}
			return newList;
		}

		function beforeEnterCallback() {
			$scope.data.local.scanConnect = true;
			$scope.data.local.devices = [];
			$scope.data.local.isScanning = true;
			getScanList();
		}

		$scope.action = {
			refreshScanList: function() {
				$scope.data.local.devices = [];
				$scope.data.local.isScanning = true;
				getScanList();
			},
			showDeviceDetail: function(device) {
				if (device.isPackup) {
					device.deviceDetailEntry = $scope.data.local.str.packup;
				} else {
					device.deviceDetailEntry = $scope.data.local.str.detail;
				}
				device.isPackup = !device.isPackup;
			},
			scanConnect: function(device) {
				// Set ssid and key to null every time before show input table
				$scope.data.local.scan.ssid = '';
				$scope.data.local.scan.key = '';
				var title = device.ssid;
				var wlan_wds_5g = {
					enable: '1',
					bssid: encodeURIComponent(device.bssid),
					encryption: device.encryption == '0' ? '0' : '1'
				};
				var oldMode = cpeService.localDataService.get('old_mode');
				var newMode = cpeService.localDataService.get('new_mode');
				var opmode = {
					op: {
						old_mode: oldMode,
						new_mode: newMode
					}
				};

				if (!device.isEncrypted) {
					if (!title) {
						// hidden ssid, title is ''
						cpeService.promptService.promptWithOptions({
							templateUrl: 'client-scan-connect-hiddenssid.html',
							scope: $scope,
							okText: cpeService.serviceConstant.STR.COMMON.BUTTON.NEXT,
							cancelText: cpeService.serviceConstant.STR.COMMON.BUTTON.CANCEL
						}, function(input) {
							if (typeof input == 'undefined') {
								// Click 'CANCEL', do nothing
								return;
							}
							if (!$scope.data.local.scan.ssid) {
								// ssid is null
								cpeService.promptService.toast.warning($scope.data.local.str.ssidOfApBlank);
								$scope.action.scanConnect(device);
								return;
							}
							wlan_wds_5g.ssid = encodeURIComponent($scope.data.local.scan.ssid);
							var requestData = {
								method: 'set',
								wireless: {
									wlan_wds_5g: wlan_wds_5g
								}
							};
							if (oldMode != newMode) {
								requestData.opmode = opmode;
							}
							cpeService.promptService.loading.show($scope.data.local.str.isSetting);
							controllerUtil.submitData(requestData);
						});
					} else {
						wlan_wds_5g.ssid = encodeURIComponent(title);
						var requestData = {
							method: 'set',
							wireless: {
								wlan_wds_5g: wlan_wds_5g
							}
						};
						if (oldMode != newMode) {
							requestData.opmode = opmode;
						}
						cpeService.promptService.loading.show($scope.data.local.str.isSetting);
						controllerUtil.submitData(requestData);
					}
				} else {
					if (!title) {
						// hidden ssid, title is ''
						cpeService.promptService.promptWithOptions({
							templateUrl: 'client-scan-connect-hiddenssid-encrypted.html',
							scope: $scope,
							okText: cpeService.serviceConstant.STR.COMMON.BUTTON.NEXT,
							cancelText: cpeService.serviceConstant.STR.COMMON.BUTTON.CANCEL
						}, function(input) {
							if (typeof input == 'undefined') {
								// Click 'CANCEL', do nothing
								return;
							}
							if (!$scope.data.local.scan.ssid) {
								// ssid is null
								cpeService.promptService.toast.warning($scope.data.local.str.ssidOfApBlank);
								$scope.action.scanConnect(device);
								return;
							}
							if (!$scope.data.local.scan.key) {
								// key is null
								cpeService.promptService.toast.warning($scope.data.local.str.keyBlank);
								$scope.action.scanConnect(device);
								return;
							}
							wlan_wds_5g.ssid = encodeURIComponent($scope.data.local.scan.ssid);
							wlan_wds_5g.key = encodeURIComponent($scope.data.local.scan.key);
							var requestData = {
								method: 'set',
								wireless: {
									wlan_wds_5g: wlan_wds_5g
								}
							};
							if (oldMode != newMode) {
								requestData.opmode = opmode;
							}
							cpeService.promptService.loading.show($scope.data.local.str.isSetting);
							controllerUtil.submitData(requestData);
						});
					} else {
						cpeService.promptService.promptWithOptions({
							templateUrl: 'client-scan-connect-encrypted.html',
							title: title,
							scope: $scope,
							okText: cpeService.serviceConstant.STR.COMMON.BUTTON.NEXT,
							cancelText: cpeService.serviceConstant.STR.COMMON.BUTTON.CANCEL
						}, function(input) {
							if (typeof input == 'undefined') {
								// Click 'CANCEL', do nothing
								return;
							}
							if (!$scope.data.local.scan.key) {
								// key is null
								cpeService.promptService.toast.warning($scope.data.local.str.keyBlank);
								$scope.action.scanConnect(device);
								return;
							}
							wlan_wds_5g.ssid = encodeURIComponent(title);
							wlan_wds_5g.key = encodeURIComponent($scope.data.local.scan.key);
							var requestData = {
								method: 'set',
								wireless: {
									wlan_wds_5g: wlan_wds_5g
								}
							};
							if (oldMode != newMode) {
								requestData.opmode = opmode;
							}
							cpeService.promptService.loading.show($scope.data.local.str.isSetting);
							controllerUtil.submitData(requestData);
						});
					}
				}
			},
			switchConnectType: function() {
				$scope.data.local.scanConnect = !$scope.data.local.scanConnect;
				if (!$scope.data.local.scanConnect) {
					$scope.data.local.input.encryption = $scope.data.local.encryptions[0];
				}
			},
			inputConnect: function() {
				var wlan_wds_5g = {
					enable: '1',
					ssid: encodeURIComponent($scope.data.local.input.ssid)
				};
				if (!$scope.data.local.input.key) {
					wlan_wds_5g.encryption = '0';
				} else {
					wlan_wds_5g.encryption = '1';
					wlan_wds_5g.key = encodeURIComponent($scope.data.local.input.key);
				}
				var requestData = {
					method: 'set',
					wireless: {
						wlan_wds_5g: wlan_wds_5g
					}
				};
				var oldMode = cpeService.localDataService.get('old_mode');
				var newMode = cpeService.localDataService.get('new_mode');
				if (oldMode != newMode) {
					requestData.opmode = {
						op: {
							old_mode: oldMode,
							new_mode: newMode
						}
					};
				}
				cpeService.promptService.loading.show($scope.data.local.str.isSetting);
				controllerUtil.submitData(requestData);
			},
			togglePassword: function() {
				if ($scope.data.local.inputType == 'password') {
					$scope.data.local.inputType = 'text';
					$scope.data.local.eyecls = 'positive';
				} else if ($scope.data.local.inputType == 'text') {
					$scope.data.local.inputType = 'password';
					$scope.data.local.eyecls = '';
				}
			}
		}
	}
])

.controller('finishCtrl', ['$scope', '$rootScope', '$state', 'cpeService',
	function($scope, $rootScope, $state, cpeService) {
		$scope.$on('$ionicView.beforeEnter', beforeEnterCallback);
		$scope.data = {
			local: {
				str: {
					finish: '完成设置',
					ap: 'Access Point 模式',
					client: 'Client 模式',
					finishing: '正在设置CPE...',
					success: '设置成功！',
					ssid: 'SSID',
					wirelessMode: '无线模式',
					bandwidth: '信道带宽',
					channel: '信道/频率',
					encryption: '加密方式',
					ssidOfAp: '远程 AP SSID',
					key: '无线密码',
					bssid: 'MAC 地址',
					quickSet: '快速设置',
					openPcWeb: '打开电脑版网页',
					tipSsid: '下次如果您需要重新设置CPE，请将手机接入SSID ',
					tipIp: '，然后在浏览器里访问 '
				}
			}
		};

		if (cpeService.localDataService.get('is_monitor_suite')) {
			$scope.data.local.str.ap = '录像机端';
			$scope.data.local.str.client = '摄像头端';
			$scope.data.local.str.ssid = '无线名称';
		}

		function getWlanData(secName) {
			cpeService.dataService.request({
				data: {
					method: 'get',
					wireless: {
						name: secName
					}
				},
				success: function(response) {
					cpeService.promptService.loading.hide();
					if (!response || response.error_code != 0) {
						cpeService.dataService.showErrMsg(response);
						return;
					}
					if (secName == 'wlan_host_5g') {
						var data = response.wireless.wlan_host_5g;
						$scope.data.local.ssid = decodeURIComponent(data.ssid);
						$scope.data.local.wirelessMode = cpeService.serviceConstant.wirelessModes[data.mode].name;
						var channelIndex = cpeService.transformService.getWirelessChannelIndex(data.channel);
						$scope.data.local.channel = cpeService.serviceConstant.channels[channelIndex].name;
						$scope.data.local.bandwidth = cpeService.serviceConstant.bandwidths[data.bandwidth].name;
						$scope.data.local.encryption = cpeService.serviceConstant.encryptions[data.encryption].name;
						$scope.data.local.key = typeof data.key == 'undefined' ? '' : decodeURIComponent(data.key);
					} else if (secName == 'wlan_wds_5g') {
						var data = response.wireless.wlan_wds_5g;
						$scope.data.local.ssidOfAp = decodeURIComponent(data.ssid);
						$scope.data.local.bssid = decodeURIComponent(data.bssid);
						$scope.data.local.key = typeof data.key == 'undefined' ? cpeService.serviceConstant.encryptions[0].name: decodeURIComponent(data.key);
					}
				},
				failure: function(e) {
					cpeService.promptService.loading.hide();
					cpeService.dataService.showErrMsg(e);
				}
			});
		}

		function getLanData() {
			cpeService.dataService.request({
				data: {
					method: 'get',
					network: {
						name: 'lan'
					}
				},
				success: function(response) {
					cpeService.promptService.loading.hide();
					if (!response || response.error_code != 0) {
						cpeService.dataService.showErrMsg(response);
						return;
					}
					$scope.data.local.ipaddr = response.network.lan.ipaddr;
				},
				failure: function(e) {
					cpeService.promptService.loading.hide();
					cpeService.dataService.showErrMsg(e);
				}
			});
		}

		function beforeEnterCallback() {
			cpeService.promptService.loading.show();
			var backPage = cpeService.routerService.getPreviousPageName();
			var secName;
			if (backPage && backPage == 'ap') {
				// Jump form ap page, and do setting successfully
				secName = 'wlan_host_5g';
				getWlanData(secName);
				getLanData();
				$scope.data.local.isAp = true;
				$scope.data.local.status = $scope.data.local.str.success;
				$scope.data.local.isSettingSuccess = true;
			} else if (backPage && backPage == 'client') {
				// Jump form client page, and do setting successfully
				secName = 'wlan_wds_5g';
				getWlanData(secName);
				$scope.data.local.isAp = false;
				$scope.data.local.status = $scope.data.local.str.success;
				$scope.data.local.isSettingSuccess = true;
			} else {
				// Came form nowhere, mostly clicked refresh, first get opmode, then get wlan data
				cpeService.dataService.request({
					data: {
						method: 'get',
						opmode: {
							name: 'op'
						}
					},
					success: function(response) {
						if (!response || response.error_code != 0) {
							cpeService.promptService.loading.hide();
							cpeService.dataService.showErrMsg(response);
							return;
						}
						var oldMode = response.opmode.op.old_mode;
						if (oldMode == 1) {
							secName = 'wlan_host_5g';
							$scope.data.local.isAp = true;
							$scope.data.local.status = $scope.data.local.str.ap;
							$scope.data.local.isSettingSuccess = false;
						} else if (oldMode == 2) {
							secName = 'wlan_wds_5g';
							$scope.data.local.isAp = false;
							$scope.data.local.status = $scope.data.local.str.client;
							$scope.data.local.isSettingSuccess = false;
						}
						getWlanData(secName);
					},
					failure: function(e) {
						cpeService.promptService.loading.hide();
						cpeService.dataService.showErrMsg(e);
					}
				});
			}
		}

		$scope.action = {
			startOver: function() {
				$state.go('opmode');
			},
			goToPcWeb: function() {
				document.location = cpeService.serviceConstant.PC_SITE;
			}
		}
	}
])
