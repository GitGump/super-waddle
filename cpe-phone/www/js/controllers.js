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
					cpeService.dataService.request({
						data: {
							method: 'do',
							network: {
								apply_lan_config: null
							}
						},
						success: function(response) {
							cpeService.promptService.loading.hide();
							if (!response || response.error_code != 0) {
								cpeService.dataService.showErrMsg(response);
								return;
							}
							cpeService.serviceValue.isSuccess = true;
							$state.go('finish');
						},
						failure: function(e) {
							cpeService.promptService.loading.hide();
							cpeService.dataService.showErrMsg();
						}
					});
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
		$scope.data = {
			local: {
				str: {
					title: '欢迎使用',
					inputUsername: '请输入用户名',
					inputPassword: '输入密码',
					setUsername: '请设置用户名',
					setPassword: '设置密码',
					agree: '我同意',
					terms: '本设备须在专业工程人员协助下进行安装。安装过程中采用的屏蔽以太网线和防雷接地线，须遵守本产品保修条款，参照本产品说明书指导进行使用。安装工作人员和最终产品使用者须遵守当地关于信道、发射功率的相关法律条款。本协议的一切解释权归普联技术有限公司所有。如需了解更多，请登录官网<a style="color: #7EADE5;" target="_blank" href="http://www.tp-link.com.cn">http://www.tp-link.com.cn</a>。',
					termsTitle: '使用条款',
					confirm: '确定',
					signIn: '登录',
					required: '此项为必填项',
					invalidUsername: '用户名应该只包含字母、数字、或下划线"_"',
					invalidPassword: '无效的密码',
					usernameLength: '用户名长度不能超过31位',
					passwordLength: '请输入6-15位字符',
					usernamePwdErr: '输入错误10次将被锁定，剩余尝试次数：'
				},
				inputType: 'password',
				eyecls: '',
				attempLoginTimesLeft: 10
			}
		}

		if (!cpeService.serviceValue.isLogin) {
			cpeService.dataService.getDeviceStatus();
		}

		function getModData(callback) {
			cpeService.dataService.request({
				data: {
					method: 'get',
					opmode: {
						name: 'op'
					},
					network: {
						name: 'lan'
					},
					wireless: {
						name: ['wlan_host_5g','wlan_wds_5g']
					},
					function: {
						name: 'module_spec'
					}
				},
				success: function(response) {
					if (!response || response.error_code != 0) {
						cpeService.promptService.toast.error(cpeService.serviceConstant.STR.COMMON.ALERT.FAILGETDATA);
						return;
					}
					var mode = response.opmode.op.old_mode;
					var lan = response.network.lan;
					var wlan_host_5g = response.wireless.wlan_host_5g;
					var wlan_wds_5g = response.wireless.wlan_wds_5g;
					cpeService.serviceValue.global.server = {
						opmode: mode,
						lan: lan,
						ap: wlan_host_5g,
						client: wlan_wds_5g
					};
					var module_spec = response.function.module_spec;
					var wirelessBand = module_spec.wireless_band;
					if (wirelessBand.split(',').length === 2) {
						// Support 2.4G and 5G
						cpeService.serviceValue.is2G = 2;
					} else {
						if (wirelessBand == '2g') {
							cpeService.serviceValue.is2G = 1;
						} else if (wirelessBand == '5g') {
							cpeService.serviceValue.is2G = 0;
						}
					}
					if (cpeService.serviceValue.is2G === 0) {
						// Get wireless 5g mode from module spec
						var wireless5GMode = decodeURIComponent(module_spec.wireless5g_mode).split(',');
						for (var i = 0; i < wireless5GMode.length; i++) {
							wireless5GMode[i] = wireless5GMode[i].replace(/^\s*/, '');
							var index = cpeService.transformService.getWirelessModeIndex(wireless5GMode[i]);
							cpeService.serviceValue.wireless5GModes.push(cpeService.serviceConstant.wirelessModes[index]);
						}
						// Get wireless 5g channel from module spec
						var wireless5GChannel = decodeURIComponent(module_spec.wireless5g_channel).split(',');
						for (var i = 0; i < wireless5GChannel.length; i++) {
							wireless5GChannel[i] = wireless5GChannel[i].replace(/^\s*/, '');
							var index = cpeService.transformService.getWirelessChannelIndex(wireless5GChannel[i]);
							cpeService.serviceValue.wireless5GChannels.push(cpeService.serviceConstant.channels[index]);
						}
						// Get wireless 5g bandwidth from module spec
						var wireless5GBandwidth = decodeURIComponent(module_spec.wireless5g_bandwidth).split(',');
						for (var i = 0; i< wireless5GBandwidth.length; i++) {
							wireless5GBandwidth[i] = wireless5GBandwidth[i].replace(/^\s*/, '');
							var index = cpeService.transformService.getWirelessBandwidthIndex(wireless5GBandwidth[i]);
							cpeService.serviceValue.wireless5GBandwidths.push(cpeService.serviceConstant.bandwidths[index]);
						}
					}
					if (typeof callback == 'function') {
						callback();
					}
				}
			});
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

			showTerms: function() {
				cpeService.promptService.alert($scope.data.local.str.terms, $scope.data.local.str.termsTitle);
			},

			signUp: function() {
				var username = $scope.data.local.username;
				var password = cpeService.authService.orgAuthPwd($scope.data.local.password);
				var url = cpeService.authService.getUrl();

				// Set username and password
				data = {
					method: 'do',
					set_password: {
						username: username,
						password: password,
						level: '1'
					}
				};

				cpeService.dataService.request({
					url: url,
					data: data,
					success: function(response) {
						if (response.error_code == 0) {
							if (response.stok) {
								cpeService.authService.setSlpUrl(response.stok);
								cpeService.authInfoService.setStok(response.stok);
							}
							cpeService.serviceValue.isLogin = true;
							cpeService.localDataService.set('username', username);
							cpeService.localDataService.set('password', password);
							getModData(function() { $state.go('opmode'); });
						}
					},
					failure: function(e) {
						// normally won't come here, so do nothing
						cpeService.serviceValue.isLogin = false;
						cpeService.dataService.showErrMsg();
					}
				});
			},

			signIn: function() {
				var username = $scope.data.local.username;
				var password = cpeService.authService.orgAuthPwd($scope.data.local.password);

				var data = {
					method: 'do',
					login: {
						username: username,
						password: password
					}
				};

				cpeService.promptService.loading.show();
				cpeService.dataService.request({
					url: cpeService.authService.getUrl(),
					data: data,
					success: function(response) {
						cpeService.promptService.loading.hide();
						if (response.error_code == 0 && response.stok) {
							cpeService.serviceValue.isLogin = true;
							cpeService.authInfoService.setStok(response.stok);
							cpeService.localDataService.set('username', username);
							cpeService.localDataService.set('password', password);
							cpeService.authService.setSlpUrl(response.stok);
							getModData(function() { $state.go('finish'); });
						} else {
							cpeService.serviceValue.isLogin = false;
							cpeService.authInfoService.removeStok();
							cpeService.authService.setSlpUrl();
							cpeService.promptService.toast.error(cpeService.serviceConstant.STR.COMMON.ALERT.FAIL);
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
									errorMsg = cpeService.serviceConstant.STR.LOGIN.ALERT.WRONGUSERNAMEPWD;
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
					}
				});
			}
		}
	}
])

.controller('opmodeCtrl', ['cpeService', '$scope', '$state', '$rootScope', 
	function(cpeService, $scope, $state, $rootScope) {
		$scope.data = {
			local: {
				str: {
					step1: '第一步，选择工作模式',
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

		$scope.data.local.opmode = $scope.data.local.opmodes[0];
		cpeService.serviceValue.global.local.opmode = $scope.data.local.opmode;

		$scope.action = {
			showOpmodeIntro: function() {
				cpeService.promptService.alert($scope.data.local.str.opmodeIntro, undefined);
			},
			goToNext: function() {
				cpeService.serviceValue.global.local.opmode = $scope.data.local.opmode;
				$state.go('lan');
			}
		}
	}
])

.controller('lanCtrl', ['$scope', '$state', '$rootScope',
	function($scope, $state, $rootScope) {
		$scope.data = {
			local: {
				str: {
					step2: '第二步，LAN 设置',
					ipaddr: 'IP 地址',
					ipaddrInput: '请输入IP 地址',
					netmask: '子网掩码',
					netmaskInput: '请输入子网掩码',
					nextStep: '下一步',
					invalidIp: '无效的IP地址格式',
					invalidMask: '无效的子网掩码格式',
					invalidIpMask: 'IP 掩码不匹配',
					required: '此项为必填项'
				}
			}
		}

		$scope.action = {
			goToNext: function() {
				cpeService.serviceValue.global.local.lan = {
					ipaddr: $scope.data.local.ipaddr,
					netmask: $scope.data.local.netmask
				};
				if (cpeService.serviceValue.global.local.opmode.value == 1) {
					$state.go('ap');
				} else if (cpeService.serviceValue.global.local.opmode.value == 2) {
					$state.go('client');
				}
			}
		}
	}
])

.controller('apCtrl', ['$scope', '$rootScope', '$state', 'cpeService', '$interval', 'controllerUtil',
	function($scope, $rootScope, $state, cpeService, $interval, controllerUtil) {
		$scope.data = {
			local: {
				str: {
					step3: '第三步，AP 设置',
					ssidInput: 'SSID',
					wirelessModeInput: '无线模式',
					encryptionInput: '加密方式',
					keyInput: '输入密钥',
					spectrumAnalysis: '频谱分析',
					scrollTip: '向右滑动查看完整频谱分析>',
					peak: '峰值',
					average: '平均值',
					current: '当前值',
					dbm: '功率(dBm)',
					channelInput: '无线信道',
					bandwidthInput: '无线带宽',
					distanceInput: '距离设置',
					distancePlaceholder: '发射端与接受端的距离',
					nextStep: '下一步',
					required: '此项为必填项',
					invalidSsid: 'SSID格式错误！最好设置为字母、数字和符号的组合',
					ssidLength: 'SSID长度不能超过32位',
					invalidKey: '密码中存在非法字符，请重新输入8 - 63位的ASCII码字符串',
					keyLength: '请输入8 - 63位字符串',
					distanceExceed: '输入范围为0 - 24',
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

		for (i = 0;i < 44; i++) {
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
		$scope.data.local.wirelessModes = cpeService.serviceValue.wireless5GModes;
		$scope.data.local.wirelessMode = $scope.data.local.wirelessModes[0];
		$scope.data.local.encryptions = cpeService.serviceConstant.encryptions;
		$scope.data.local.encryption = $scope.data.local.encryptions[0];
		$scope.data.local.channels = cpeService.serviceValue.wireless5GChannels;
		$scope.data.local.channel = $scope.data.local.channels[0];
		$scope.data.local.bandwidths = cpeService.serviceValue.wireless5GBandwidths;
		$scope.data.local.bandwidth = $scope.data.local.bandwidths[0];

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

		// Do not fire spectrum analysis now, something about capbility still need discussing
		// startSpectrumAnalysis($scope.data.local.spectrum.range[0]);

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
				cpeService.serviceValue.global.local.ap = {
					ssid: $scope.data.local.ssid,
					wirelessMode: $scope.data.local.wirelessMode,
					encryption: $scope.data.local.encryption,
					key: $scope.data.local.key,
					channel: $scope.data.local.channel,
					bandwidth: $scope.data.local.bandwidth,
					distance: $scope.data.local.distance
				};

				var lan = {
					ipaddr: cpeService.serviceValue.global.local.lan.ipaddr,
					netmask: cpeService.serviceValue.global.local.lan.netmask,
					proto: 'static'
				};

				var wlan_host_5g = {
					enable: '1',
					ssid: encodeURIComponent($scope.data.local.ssid),
					mode: $scope.data.local.wirelessMode.value,
					encryption: $scope.data.local.encryption.value,
					key: $scope.data.local.key,
					channel: $scope.data.local.channel.value,
					bandwidth: $scope.data.local.bandwidth.value,
					ack_number: $scope.data.local.distance.toString()
				}

				var requestData = {
					method: 'set',
					network: {
						lan: lan
					},
					wireless: {
						wlan_host_5g: wlan_host_5g
					}
				};

				var old_mode = cpeService.serviceValue.global.server.opmode;
				var new_mode = cpeService.serviceValue.global.local.opmode.value;

				if (old_mode != new_mode) {
					// if wds on, channel/bandwidth/mode cannot be set, so change opmode firstly
					var modeData = {
						method: 'set',
						opmode: {
							op: {
								old_mode: old_mode,
								new_mode: new_mode
							}
						}
					};
					cpeService.promptService.loading.show(cpeService.serviceConstant.STR.COMMON.LABEL.ISSETTING);
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
							cpeService.dataService.showErrMsg();
						}
					});
				} else {
					cpeService.promptService.loading.show(cpeService.serviceConstant.STR.COMMON.LABEL.ISSETTING);
					controllerUtil.submitData(requestData);
				}
			}
		}

		$scope.action.changeModeOrChannel();
		$scope.action.changeBandwidth();
	}
])

.controller('clientCtrl', ['$scope', '$rootScope', '$state', 'cpeService', 'controllerUtil',
	function($scope, $rootScope, $state, cpeService, controllerUtil) {
		$scope.data = {
			local: {
				str: {
					step3: '第三步，Client 设置',
					selectNetwork: '请选择远程AP SSID',
					detail: '详情',
					packup: '收起',
					other: '其他',
					bssid: 'MAC 地址',
					snr: '信噪比(dB)',
					noise: '信号／噪声(dBm)',
					channel: '信道',
					ssidOfAp: '远程AP SSID',
					inputKey: '输入密钥',
					encryption: '加密方式',
					distanceInput: '距离设置',
					select: '选择',
					distancePlaceholder: '发射端与接受端的距离',
					nextStep: '下一步',
					required: '此项为必填项',
					invalidSsid: 'SSID格式错误！最好设置为字母、数字和符号的组合',
					ssidLength: 'SSID长度不能超过32位',
					invalidKey: '密码中存在非法字符，请重新输入8 - 63位的ASCII码字符串',
					keyLength: '请输入8 - 63位字符串',
					distanceExceed: '输入范围为0 - 24',
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

		function getScanList() {
			cpeService.dataService.request({
				timeout: 30 * 1000,
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
				device.index = item;
				device.deviceName = decodeURIComponent(device.device_name);
				device.ssid = decodeURIComponent(device.ssid);
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

		getScanList();
		$scope.data.local.input.encryption = $scope.data.local.encryptions[0];

		$scope.action = {
			refreshScanList: function() {
				$scope.data.local.devices = [];
				$scope.data.local.isScanning = true;
				getScanList();
			},
			showDeviceDetail: function(device) {
				if (device.isPackup) {
					$scope.data.local.devices[device.index].deviceDetailEntry = $scope.data.local.str.packup;
				} else {
					$scope.data.local.devices[device.index].deviceDetailEntry = $scope.data.local.str.detail;
				}
				$scope.data.local.devices[device.index].isPackup = !$scope.data.local.devices[device.index].isPackup;
			},
			scanConnect: function(device) {
				var title = device.ssid;
				var wlan_wds_5g = {
					enable: '1',
					ssid: encodeURIComponent(title),
					bssid: encodeURIComponent(device.bssid),
					encryption: device.encryption == '0' ? '0' : '1'
				};
				var lan = {
					ipaddr: cpeService.serviceValue.global.local.lan.ipaddr,
					netmask: cpeService.serviceValue.global.local.lan.netmask,
					proto: 'static'
				};

				cpeService.promptService.promptWithOptions({
					templateUrl: device.isEncrypted ? 'client-scan-connect-encrypted.html' : 'client-scan-connect.html',
					title: title,
					scope: $scope,
					okText: cpeService.serviceConstant.STR.COMMON.BUTTON.NEXT,
					cancelText: cpeService.serviceConstant.STR.COMMON.BUTTON.CANCEL
				}, function(input) {
					if (input == undefined) {
						// Click 'CANCEL', do nothing
						return;
					}
					if (device.isEncrypted) {
						wlan_wds_5g.key = $scope.data.local.scan.key;
					}
					wlan_wds_5g.ack_number = $scope.data.local.scan.distance.toString();
					cpeService.serviceValue.global.local.client = wlan_wds_5g;
					var requestData = {
						method: 'set',
						opmode: {
							op: {
								old_mode: cpeService.serviceValue.global.server.opmode,
								new_mode: cpeService.serviceValue.global.local.opmode.value
							}
						},
						network: {
							lan: lan
						},
						wireless: {
							wlan_wds_5g: wlan_wds_5g
						}
					};
					cpeService.promptService.loading.show(cpeService.serviceConstant.STR.COMMON.LABEL.ISSETTING);
					controllerUtil.submitData(requestData);
				});
			},
			switchConnectType: function() {
				$scope.data.local.scanConnect = !$scope.data.local.scanConnect;
				$scope.action.refreshScanList();
			},
			inputConnect: function() {
				var lan = {
					ipaddr: cpeService.serviceValue.global.local.lan.ipaddr,
					netmask: cpeService.serviceValue.global.local.lan.netmask,
					proto: 'static'
				};
				var wlan_wds_5g = {
					enable: '1',
					ssid: encodeURIComponent($scope.data.local.input.ssid),
					encryption: $scope.data.local.input.encryption.value,
					key: $scope.data.local.input.key,
					ack_number: $scope.data.local.input.distance.toString()
				};
				cpeService.serviceValue.global.local.client = wlan_wds_5g;
				var requestData = {
					method: 'set',
					opmode: {
						op: {
							old_mode: cpeService.serviceValue.global.server.opmode,
							new_mode: cpeService.serviceValue.global.local.opmode.value
						}
					},
					network: {
						lan: lan
					},
					wireless: {
						wlan_wds_5g: wlan_wds_5g
					}
				};
				cpeService.promptService.loading.show(cpeService.serviceConstant.STR.COMMON.LABEL.ISSETTING);
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
		$scope.$on('$ionicView.enter', enterCallback);
		$scope.data = {
			local: {
				str: {
					finish: '完成设置',
					ap: 'Access Point 模式',
					client: 'Client 模式',
					finishing: '正在设置CPE...',
					success: '设置成功！',
					ipaddr: 'LAN IP地址',
					mask: 'LAN 子网掩码',
					ssid: 'SSID',
					wirelessMode: '无线模式',
					bandwidth: '信道带宽',
					channel: '信道/频率',
					encryption: '加密方式',
					distance: '距离设置',
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

		function enterCallback() {
			if (cpeService.serviceValue.isSuccess || cpeService.serviceValue.isStartOver) {
				var data = cpeService.serviceValue.global.local;
				if (data.opmode.value == cpeService.serviceConstant.OPMODE.AP) {
					// AP mode
					$scope.data.local.isAp = true;
					$scope.data.local.status = $scope.data.local.str.success;
					$scope.data.local.ssid = decodeURIComponent(data.ap.ssid);
					$scope.data.local.wirelessMode = data.ap.wirelessMode.name;
					$scope.data.local.channel = data.ap.channel.name;
					$scope.data.local.bandwidth = data.ap.bandwidth.name;
					$scope.data.local.encryption = data.ap.encryption.name;
					$scope.data.local.key = data.ap.key;
					$scope.data.local.distance = data.ap.distance + 'km';
				} else if (data.opmode.value == cpeService.serviceConstant.OPMODE.CLIENT) {
					// Client mode
					$scope.data.local.isAp = false;
					$scope.data.local.status = $scope.data.local.str.success;
					$scope.data.local.ssidOfAp = decodeURIComponent(data.client.ssid);
					$scope.data.local.bssid = decodeURIComponent(data.client.bssid);
					$scope.data.local.key = data.client.key == undefined ? cpeService.serviceConstant.encryptions[0].name: data.client.key;
					$scope.data.local.distance = data.client.ack_number + 'km';
				}
			} else {
				var data = cpeService.serviceValue.global.server;
				if (data.opmode == cpeService.serviceConstant.OPMODE.AP) {
					// AP mode
					$scope.data.local.isAp = true;
					$scope.data.local.status = $scope.data.local.str.ap;
					$scope.data.local.ssid = decodeURIComponent(data.ap.ssid);
					$scope.data.local.wirelessMode = cpeService.serviceConstant.wirelessModes[data.ap.mode].name;
					var channelIndex = cpeService.transformService.getWirelessChannelIndex(data.ap.channel);
					$scope.data.local.channel = cpeService.serviceConstant.channels[channelIndex].name;
					$scope.data.local.bandwidth = cpeService.serviceConstant.bandwidths[data.ap.bandwidth].name;
					$scope.data.local.encryption = cpeService.serviceConstant.encryptions[data.ap.encryption].name;
					$scope.data.local.key = data.ap.key;
					$scope.data.local.distance = data.ap.ack_number + 'km';
				} else if (data.opmode == cpeService.serviceConstant.OPMODE.CLIENT) {
					// Client mode
					$scope.data.local.isAp = false;
					$scope.data.local.status = $scope.data.local.str.client;
					$scope.data.local.ssidOfAp = decodeURIComponent(data.client.ssid);
					$scope.data.local.bssid = decodeURIComponent(data.client.bssid);
					$scope.data.local.key = data.client.key == undefined ? cpeService.serviceConstant.encryptions[0].name: data.client.key;
					$scope.data.local.distance = data.client.ack_number + 'km';
				}
			}
			$scope.data.local.ipaddr = data.lan.ipaddr;
			$scope.data.local.netmask = data.lan.netmask;
		}

		$scope.action = {
			startOver: function() {
				cpeService.serviceValue.isStartOver = true;
				$state.go('opmode');
			},
			goToPcWeb: function() {
				document.location = cpeService.serviceConstant.PC_SITE;
			}
		}
	}
])
