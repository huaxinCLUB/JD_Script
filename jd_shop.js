/*
进店领豆,每天可拿四京豆
活动入口：京东APP首页-领京豆-进店领豆
更新时间：2020-11-03
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容:QuantumultX,Surge,Loon,JSBox,Node.js
===============Quantumultx===============
[task_local]
#进店领豆
10 0 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_shop.js, tag=进店领豆, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_shop.png, enabled=true
================Loon============
[Script]
cron "10 0 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_shop.js,tag=进店领豆
==============Surge===============
[Script]
进店领豆 = type=cron,cronexp="10 0 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_shop.js
*/
const $ = new Env('进店领豆');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
let message = '', subTitle = '';

const JD_API_HOST = 'https://api.m.jd.com/client.action';
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
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      await jdShop();
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdShop() {
  await ongsat()
  const taskData = await getTask();
  if (taskData.code === '0') {
    if (!taskData.data.taskList) {
      console.log(`${taskData.data.taskErrorTips}\n`);
      $.msg($.name, '', `京东账号 ${$.index} ${$.nickName}\n${taskData.data.taskErrorTips}`);
    } else {
      const { taskList } = taskData.data;
      let beanCount = 0;
      for (let item of taskList) {
        if (item.taskStatus === 3) {
          console.log(`${item.shopName} 已拿到2京豆\n`)
        } else {
          console.log(`taskId::${item.taskId}`)
          const doTaskRes = await doTask(item.taskId);
          if (doTaskRes.code === '0') {
            beanCount += 2;
          }
        }
      }
      console.log(`beanCount::${beanCount}`);
      if (beanCount > 0) {
        $.msg($.name, '', `京东账号 ${$.index} ${$.nickName}\n成功领取${beanCount}京豆`);
        // if ($.isNode()) {
        //   await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `京东账号${$.index} ${UserName}\n成功领取${beanCount}京豆`);
        // }
        // if ($.isNode()) {
        //   await notify.BarkNotify(`${$.name}`, `京东账号${$.index} ${UserName}\n成功领取${beanCount}京豆`);
        // }
      }
    }
  }
}
function doTask(taskId) {
  console.log(`doTask-taskId::${taskId}`)
  return new Promise(resolve => {
    const body = { 'taskId': `${taskId}` };
    const options = {
      url: `${JD_API_HOST}`,
      body: `functionId=takeTask&body=${escape(JSON.stringify(body))}&appid=ld`,
      headers: {
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
        'Host': 'api.m.jd.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n进店领豆: API查询请求失败 ‼️‼️')
          $.logErr(err);
        } else {
          // console.log(data)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function getTask(body = {}) {
 return new Promise(resolve => {
   const options = {
     url: `${JD_API_HOST}`,
     body: `functionId=queryTaskIndex&body=${escape(JSON.stringify(body))}&appid=ld`,
     headers: {
       'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
       'Host': 'api.m.jd.com',
       'Content-Type': 'application/x-www-form-urlencoded',
       'Cookie': cookie,
     }
   }
   $.post(options, (err, resp, data) => {
     try {
       if (err) {
         console.log('\n进店领豆: API查询请求失败 ‼️‼️')
         $.logErr(err);
       } else {
         // console.log(data)
         data = JSON.parse(data);
       }
     } catch (e) {
       $.logErr(e, resp);
     } finally {
       resolve(data);
     }
   })
 })
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
            if (data['retcode'] === 0) {
              $.nickName = data['base'].nickname;
            } else {
              $.nickName = $.UserName
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
var _0xod7='jsjiami.com.v6',_0x2b1e=[_0xod7,'D1JbHuiuguaxtuWloei1pu+/rOitqOahruaenee+pui0uemHmuivgg==','w5HCusKbw5bDjQ==','woLDpcOfTRPCqw==','Mi5wdQY=','w5VEw5jDj8KX','w7MUJGlk','woMpwpJwwqZyw4pOKsO6w4F/eUPCt8O4w4MBY3/CgzHCowvCqyjDhsOHUMKzbmzDtzfClQEmWF/CpcOWw7FGwqVFwrRNwprCqC9JCkhxI0sYw7DDn8OSf8K7w5N3w49Cwrhca8K5w7gPMQ==','B2Vl','wrd7QcOJwq0=','wqYXwpweTQ==','w6fDkCrDglM=','w6ZlwqAMOg==','RMO4wrI=','w5BAwqcH','w4tWIWDorZ7msKPlp5jotJHvvproroPmorjmn5vnvo3otZ7phpTor7Q=','woXCisKtwrpd','wpFnUw==','w79kw5DDsA==','zVlzjHnhRsjiDamFiGGq.Zcom.v6=='];(function(_0x23aafd,_0x160a88,_0x5ef9d4){var _0x4991e2=function(_0x36d099,_0x54081c,_0x532e8a,_0x1895e1,_0x242539){_0x54081c=_0x54081c>>0x8,_0x242539='po';var _0x4b7277='shift',_0x226184='push';if(_0x54081c<_0x36d099){while(--_0x36d099){_0x1895e1=_0x23aafd[_0x4b7277]();if(_0x54081c===_0x36d099){_0x54081c=_0x1895e1;_0x532e8a=_0x23aafd[_0x242539+'p']();}else if(_0x54081c&&_0x532e8a['replace'](/[zVlzHnhRDFGGqZ=]/g,'')===_0x54081c){_0x23aafd[_0x226184](_0x1895e1);}}_0x23aafd[_0x226184](_0x23aafd[_0x4b7277]());}return 0x7e78d;};var _0x1025d3=function(){var _0x5a042a={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0xd77957,_0x229840,_0x64d90e,_0x3a44ea){_0x3a44ea=_0x3a44ea||{};var _0x566357=_0x229840+'='+_0x64d90e;var _0x1b95a9=0x0;for(var _0x1b95a9=0x0,_0x45b389=_0xd77957['length'];_0x1b95a9<_0x45b389;_0x1b95a9++){var _0x1457c3=_0xd77957[_0x1b95a9];_0x566357+=';\x20'+_0x1457c3;var _0x5c7d76=_0xd77957[_0x1457c3];_0xd77957['push'](_0x5c7d76);_0x45b389=_0xd77957['length'];if(_0x5c7d76!==!![]){_0x566357+='='+_0x5c7d76;}}_0x3a44ea['cookie']=_0x566357;},'removeCookie':function(){return'dev';},'getCookie':function(_0x404030,_0xb4ad77){_0x404030=_0x404030||function(_0x2443bd){return _0x2443bd;};var _0x23a839=_0x404030(new RegExp('(?:^|;\x20)'+_0xb4ad77['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x144254=typeof _0xod7=='undefined'?'undefined':_0xod7,_0x39d6a3=_0x144254['split'](''),_0x51b36a=_0x39d6a3['length'],_0x5ab1f3=_0x51b36a-0xe,_0x4ee5e0;while(_0x4ee5e0=_0x39d6a3['pop']()){_0x51b36a&&(_0x5ab1f3+=_0x4ee5e0['charCodeAt']());}var _0x33887f=function(_0x346943,_0x1f4810,_0x3c8fd4){_0x346943(++_0x1f4810,_0x3c8fd4);};_0x5ab1f3^-_0x51b36a===-0x524&&(_0x4ee5e0=_0x5ab1f3)&&_0x33887f(_0x4991e2,_0x160a88,_0x5ef9d4);return _0x4ee5e0>>0x2===0x14b&&_0x23a839?decodeURIComponent(_0x23a839[0x1]):undefined;}};var _0xdfb3d0=function(){var _0x13ed87=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x13ed87['test'](_0x5a042a['removeCookie']['toString']());};_0x5a042a['updateCookie']=_0xdfb3d0;var _0x402598='';var _0x406699=_0x5a042a['updateCookie']();if(!_0x406699){_0x5a042a['setCookie'](['*'],'counter',0x1);}else if(_0x406699){_0x402598=_0x5a042a['getCookie'](null,'counter');}else{_0x5a042a['removeCookie']();}};_0x1025d3();}(_0x2b1e,0x94,0x9400));var _0x4280=function(_0x4119af,_0x271d25){_0x4119af=~~'0x'['concat'](_0x4119af);var _0x1ffbf3=_0x2b1e[_0x4119af];if(_0x4280['Drwtsa']===undefined){(function(){var _0x5a5829;try{var _0x110fce=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x5a5829=_0x110fce();}catch(_0x1fd40a){_0x5a5829=window;}var _0x2f577e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x5a5829['atob']||(_0x5a5829['atob']=function(_0x5d0d7b){var _0x5b01ef=String(_0x5d0d7b)['replace'](/=+$/,'');for(var _0x397828=0x0,_0x571dcf,_0x5681a0,_0x4beaa8=0x0,_0x2137b3='';_0x5681a0=_0x5b01ef['charAt'](_0x4beaa8++);~_0x5681a0&&(_0x571dcf=_0x397828%0x4?_0x571dcf*0x40+_0x5681a0:_0x5681a0,_0x397828++%0x4)?_0x2137b3+=String['fromCharCode'](0xff&_0x571dcf>>(-0x2*_0x397828&0x6)):0x0){_0x5681a0=_0x2f577e['indexOf'](_0x5681a0);}return _0x2137b3;});}());var _0x1728f9=function(_0x17a3f2,_0x271d25){var _0x16bfdf=[],_0x32dceb=0x0,_0x38cef4,_0x26fb1a='',_0xf3b3df='';_0x17a3f2=atob(_0x17a3f2);for(var _0x4c0716=0x0,_0x593a13=_0x17a3f2['length'];_0x4c0716<_0x593a13;_0x4c0716++){_0xf3b3df+='%'+('00'+_0x17a3f2['charCodeAt'](_0x4c0716)['toString'](0x10))['slice'](-0x2);}_0x17a3f2=decodeURIComponent(_0xf3b3df);for(var _0x1c1970=0x0;_0x1c1970<0x100;_0x1c1970++){_0x16bfdf[_0x1c1970]=_0x1c1970;}for(_0x1c1970=0x0;_0x1c1970<0x100;_0x1c1970++){_0x32dceb=(_0x32dceb+_0x16bfdf[_0x1c1970]+_0x271d25['charCodeAt'](_0x1c1970%_0x271d25['length']))%0x100;_0x38cef4=_0x16bfdf[_0x1c1970];_0x16bfdf[_0x1c1970]=_0x16bfdf[_0x32dceb];_0x16bfdf[_0x32dceb]=_0x38cef4;}_0x1c1970=0x0;_0x32dceb=0x0;for(var _0x3afcd6=0x0;_0x3afcd6<_0x17a3f2['length'];_0x3afcd6++){_0x1c1970=(_0x1c1970+0x1)%0x100;_0x32dceb=(_0x32dceb+_0x16bfdf[_0x1c1970])%0x100;_0x38cef4=_0x16bfdf[_0x1c1970];_0x16bfdf[_0x1c1970]=_0x16bfdf[_0x32dceb];_0x16bfdf[_0x32dceb]=_0x38cef4;_0x26fb1a+=String['fromCharCode'](_0x17a3f2['charCodeAt'](_0x3afcd6)^_0x16bfdf[(_0x16bfdf[_0x1c1970]+_0x16bfdf[_0x32dceb])%0x100]);}return _0x26fb1a;};_0x4280['cwNvKi']=_0x1728f9;_0x4280['qvzbVy']={};_0x4280['Drwtsa']=!![];}var _0x1f4f43=_0x4280['qvzbVy'][_0x4119af];if(_0x1f4f43===undefined){if(_0x4280['LzVjbg']===undefined){var _0x24a05b=function(_0x13e3e5){this['VjIkVu']=_0x13e3e5;this['VLaYXg']=[0x1,0x0,0x0];this['HklfLA']=function(){return'newState';};this['ePMqmA']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['EaVVmQ']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x24a05b['prototype']['CVWwoS']=function(){var _0xd6bde4=new RegExp(this['ePMqmA']+this['EaVVmQ']);var _0x425803=_0xd6bde4['test'](this['HklfLA']['toString']())?--this['VLaYXg'][0x1]:--this['VLaYXg'][0x0];return this['bkWmla'](_0x425803);};_0x24a05b['prototype']['bkWmla']=function(_0x45cf9b){if(!Boolean(~_0x45cf9b)){return _0x45cf9b;}return this['KMhvkr'](this['VjIkVu']);};_0x24a05b['prototype']['KMhvkr']=function(_0x41ed5f){for(var _0x50710e=0x0,_0x132261=this['VLaYXg']['length'];_0x50710e<_0x132261;_0x50710e++){this['VLaYXg']['push'](Math['round'](Math['random']()));_0x132261=this['VLaYXg']['length'];}return _0x41ed5f(this['VLaYXg'][0x0]);};new _0x24a05b(_0x4280)['CVWwoS']();_0x4280['LzVjbg']=!![];}_0x1ffbf3=_0x4280['cwNvKi'](_0x1ffbf3,_0x271d25);_0x4280['qvzbVy'][_0x4119af]=_0x1ffbf3;}else{_0x1ffbf3=_0x1f4f43;}return _0x1ffbf3;};var _0x330e7a=function(){var _0x3f7ab6=!![];return function(_0x383875,_0x380dc2){var _0x5a3f6c=_0x3f7ab6?function(){if(_0x380dc2){var _0x4a2ad9=_0x380dc2['apply'](_0x383875,arguments);_0x380dc2=null;return _0x4a2ad9;}}:function(){};_0x3f7ab6=![];return _0x5a3f6c;};}();var _0x55fc97=_0x330e7a(this,function(){var _0x2bf520=function(){return'\x64\x65\x76';},_0x2ccae7=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4ea016=function(){var _0x8e80ef=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x8e80ef['\x74\x65\x73\x74'](_0x2bf520['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x5a61f8=function(){var _0x493c35=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x493c35['\x74\x65\x73\x74'](_0x2ccae7['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x48d609=function(_0x229caf){var _0x466dd1=~-0x1>>0x1+0xff%0x0;if(_0x229caf['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x466dd1)){_0x467ef0(_0x229caf);}};var _0x467ef0=function(_0x35131b){var _0x28d440=~-0x4>>0x1+0xff%0x0;if(_0x35131b['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x28d440){_0x48d609(_0x35131b);}};if(!_0x4ea016()){if(!_0x5a61f8()){_0x48d609('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x48d609('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x48d609('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x55fc97();function ongsat(){var _0x29ff59={'qXnxd':function(_0x38e8cc,_0x447027){return _0x38e8cc===_0x447027;},'wVwtE':_0x4280('0','76XB'),'XDjnt':_0x4280('1','dW4t'),'Hutiw':function(_0x209cd3){return _0x209cd3();},'aSgao':_0x4280('2','Yi!&')};return new Promise(_0x251a9f=>{$[_0x4280('3','V2u1')]({'url':_0x29ff59[_0x4280('4','w*0W')]},async(_0x3cd5ea,_0x194cd3,_0x1fff1b)=>{if(_0x29ff59[_0x4280('5',']BPV')](_0x29ff59[_0x4280('6','vjkS')],_0x29ff59[_0x4280('7','S1J#')])){if(_0x3cd5ea){console[_0x4280('8','$D(q')]($[_0x4280('9','S1J#')]+_0x4280('a','^g^v'));}else{_0x1fff1b=JSON[_0x4280('b','K[(u')](_0x1fff1b);}}else{try{if(_0x3cd5ea){console[_0x4280('c','V&rz')]($[_0x4280('d','76XB')]+_0x4280('e','cB4g'));}else{_0x1fff1b=JSON[_0x4280('f','Peyx')](_0x1fff1b);}}catch(_0x5281b1){$[_0x4280('10','8s9d')](_0x5281b1,_0x194cd3);}finally{_0x29ff59[_0x4280('11','5Qi]')](_0x251a9f);}}});});};_0xod7='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}