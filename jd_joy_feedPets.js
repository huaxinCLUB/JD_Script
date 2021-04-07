/*
宠汪汪喂食(如果喂食80g失败，降级一个档次喂食（40g）,依次类推),三餐，建议一小时运行一次
更新时间：2020-11-03
活动入口：京东APP我的-更多工具-宠汪汪
支持京东多个账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
==============Quantumult X==============
[task_local]
#京东宠汪汪喂食
15 0-23/1 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_feedPets.js, tag=京东宠汪汪喂食, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdcww.png, enabled=true

==============Loon===============
[Script]
cron "15 0-23/1 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_feedPets.js,tag=京东宠汪汪喂食

=========Surge=============
[Script]
京东宠汪汪喂食 = type=cron,cronexp="15 0-23/1 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_feedPets.js

===============小火箭==========
京东宠汪汪喂食 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_feedPets.js, cronexpr="15 0-23/1 * * *", timeout=3600, enable=true
*/
  const $ = new Env('宠汪汪🐕喂食');
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
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
  }
  let jdNotify = true;//是否开启静默运行。默认true开启
  let message = '', subTitle = '';
  const JD_API_HOST = 'https://jdjoy.jd.com'
  let FEED_NUM = ($.getdata('joyFeedCount') * 1) || 10;   //喂食数量默认10g,可选 10,20,40,80 , 其他数字不可.
  
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
        if ($.isNode()) {
          if (process.env.JOY_FEED_COUNT) {
            if ([0, 10, 20, 40, 80].indexOf(process.env.JOY_FEED_COUNT * 1) > -1) {
              FEED_NUM = process.env.JOY_FEED_COUNT ? process.env.JOY_FEED_COUNT * 1 : FEED_NUM;
            } else {
              console.log(`您输入的 JOY_FEED_COUNT 为非法数字，请重新输入`);
            }
          }
        }
        await feedPets(FEED_NUM);//喂食
        await ThreeMeals();//三餐
        await showMsg();
      }
    }
  })()
      .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
      })
      .finally(() => {
        $.done();
      })
  function showMsg() {
    $.log(`\n${message}\n`);
    jdNotify = $.getdata('jdJoyNotify') ? $.getdata('jdJoyNotify') : jdNotify;
    if (!jdNotify || jdNotify === 'false') {
      //$.msg($.name, subTitle, `【京东账号${$.index}】${$.UserName}\n` + message);
    }
  }
  function feedPets(feedNum) {
    return new Promise(resolve => {
      console.log(`您设置的喂食数量::${FEED_NUM}g\n`);
      if (FEED_NUM === 0) { console.log(`跳出喂食`);resolve();return }
      console.log(`实际的喂食数量::${feedNum}g\n`);
      let opt = {
        url: `//jdjoy.jd.com/common/pet/feed?feedCount=${feedNum}&reqSource=h5`,
        // url: "//draw.jdfcloud.com/common/pet/getPetTaskConfig?reqSource=h5",
        method: "GET",
        data: {},
        credentials: "include",
        header: {"content-type": "application/json"}
      }
      const url = "https:"+ taroRequest(opt)['url']
      const options = {
        url,
        headers: {
          'Cookie': cookie,
          'reqSource': 'h5',
          'Host': 'jdjoy.jd.com',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'Referer': 'https://jdjoy.jd.com/pet/index',
          'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
          'Accept-Language': 'zh-cn',
          'Accept-Encoding': 'gzip, deflate, br',
        }
      }
      $.get(options, async (err, resp, data) => {
        try {
          $.data = JSON.parse(data);
          if ($.data.success) {
            if ($.data.errorCode === 'feed_ok') {
              console.log('喂食成功')
              message += `【喂食成功】${feedNum}g\n`;
            } else if ($.data.errorCode === 'time_error') {
              console.log('喂食失败：正在食用')
              message += `【喂食失败】您的汪汪正在食用\n`;
            } else if ($.data.errorCode === 'food_insufficient') {
              console.log(`当前喂食${feedNum}g狗粮不够, 现为您降低一档次喂食\n`)
              if ((feedNum) === 80) {
                feedNum = 40;
              } else if ((feedNum) === 40) {
                feedNum = 20;
              } else if ((feedNum) === 20) {
                feedNum = 10;
              } else if ((feedNum) === 10) {
                feedNum = 0;
              }
              // 如果喂食设置的数量失败, 就降低一个档次喂食.
              if ((feedNum) !== 0) {
                await feedPets(feedNum);
              } else {
                console.log('您的狗粮已不足10g')
                message += `【喂食失败】您的狗粮已不足10g\n`;
              }
            } else {
              console.log(`其他状态${$.data.errorCode}`)
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve($.data);
        }
      })
    })
  }
  
  //三餐
  function ThreeMeals() {
    return new Promise(resolve => {
      let opt = {
        url: "//jdjoy.jd.com/common/pet/getFood?taskType=ThreeMeals&reqSource=h5",
        // url: "//draw.jdfcloud.com/common/pet/getPetTaskConfig?reqSource=h5",
        method: "GET",
        data: {},
        credentials: "include",
        header: {"content-type": "application/json"}
      }
      const url = "https:"+ taroRequest(opt)['url']
      const options = {
        url,
        headers: {
          'Cookie': cookie,
          'reqSource': 'h5',
          'Host': 'jdjoy.jd.com',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'Referer': 'https://jdjoy.jd.com/pet/index',
          'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
          'Accept-Language': 'zh-cn',
          'Accept-Encoding': 'gzip, deflate, br',
        }
      }
      $.get(options, async (err, resp, data) => {
        try {
          data = JSON.parse(data);
          if (data.success) {
            if (data.errorCode === 'received') {
              console.log(`三餐结果领取成功`)
              message += `【三餐】领取成功，获得${data.data}g狗粮\n`;
            }
          }
        } catch (e) {
          $.logErr(resp, e);
        } finally {
          resolve(data);
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
  var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb227b=["\x69\x73\x4E\x6F\x64\x65","\x63\x72\x79\x70\x74\x6F\x2D\x6A\x73","\x39\x38\x63\x31\x34\x63\x39\x39\x37\x66\x64\x65\x35\x30\x63\x63\x31\x38\x62\x64\x65\x66\x65\x63\x66\x64\x34\x38\x63\x65\x62\x37","\x70\x61\x72\x73\x65","\x55\x74\x66\x38","\x65\x6E\x63","\x65\x61\x36\x35\x33\x66\x34\x66\x33\x63\x35\x65\x64\x61\x31\x32","\x63\x69\x70\x68\x65\x72\x74\x65\x78\x74","\x43\x42\x43","\x6D\x6F\x64\x65","\x50\x6B\x63\x73\x37","\x70\x61\x64","\x65\x6E\x63\x72\x79\x70\x74","\x41\x45\x53","\x48\x65\x78","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x42\x61\x73\x65\x36\x34","\x64\x65\x63\x72\x79\x70\x74","\x6C\x65\x6E\x67\x74\x68","\x6D\x61\x70","\x73\x6F\x72\x74","\x6B\x65\x79\x73","\x67\x69\x66\x74","\x70\x65\x74","\x69\x6E\x63\x6C\x75\x64\x65\x73","\x26","\x6A\x6F\x69\x6E","\x3D","\x3F","\x69\x6E\x64\x65\x78\x4F\x66","\x63\x6F\x6D\x6D\x6F\x6E\x2F","\x72\x65\x70\x6C\x61\x63\x65","\x68\x65\x61\x64\x65\x72","\x75\x72\x6C","\x72\x65\x71\x53\x6F\x75\x72\x63\x65\x3D\x68\x35","\x61\x73\x73\x69\x67\x6E","\x6D\x65\x74\x68\x6F\x64","\x47\x45\x54","\x64\x61\x74\x61","\x74\x6F\x4C\x6F\x77\x65\x72\x43\x61\x73\x65","\x6B\x65\x79\x43\x6F\x64\x65","\x63\x6F\x6E\x74\x65\x6E\x74\x2D\x74\x79\x70\x65","\x43\x6F\x6E\x74\x65\x6E\x74\x2D\x54\x79\x70\x65","","\x67\x65\x74","\x70\x6F\x73\x74","\x61\x70\x70\x6C\x69\x63\x61\x74\x69\x6F\x6E\x2F\x78\x2D\x77\x77\x77\x2D\x66\x6F\x72\x6D\x2D\x75\x72\x6C\x65\x6E\x63\x6F\x64\x65\x64","\x5F","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];function taroRequest(_0x1226x2){const _0x1226x3=$[__Oxb227b[0x0]]()?require(__Oxb227b[0x1]):CryptoJS;const _0x1226x4=__Oxb227b[0x2];const _0x1226x5=_0x1226x3[__Oxb227b[0x5]][__Oxb227b[0x4]][__Oxb227b[0x3]](_0x1226x4);const _0x1226x6=_0x1226x3[__Oxb227b[0x5]][__Oxb227b[0x4]][__Oxb227b[0x3]](__Oxb227b[0x6]);let _0x1226x7={"\x41\x65\x73\x45\x6E\x63\x72\x79\x70\x74":function _0x1226x8(_0x1226x2){var _0x1226x9=_0x1226x3[__Oxb227b[0x5]][__Oxb227b[0x4]][__Oxb227b[0x3]](_0x1226x2);return _0x1226x3[__Oxb227b[0xd]][__Oxb227b[0xc]](_0x1226x9,_0x1226x5,{"\x69\x76":_0x1226x6,"\x6D\x6F\x64\x65":_0x1226x3[__Oxb227b[0x9]][__Oxb227b[0x8]],"\x70\x61\x64\x64\x69\x6E\x67":_0x1226x3[__Oxb227b[0xb]][__Oxb227b[0xa]]})[__Oxb227b[0x7]].toString()},"\x41\x65\x73\x44\x65\x63\x72\x79\x70\x74":function _0x1226xa(_0x1226x2){var _0x1226x9=_0x1226x3[__Oxb227b[0x5]][__Oxb227b[0xe]][__Oxb227b[0x3]](_0x1226x2),_0x1226xb=_0x1226x3[__Oxb227b[0x5]][__Oxb227b[0x10]][__Oxb227b[0xf]](_0x1226x9);return _0x1226x3[__Oxb227b[0xd]][__Oxb227b[0x11]](_0x1226xb,_0x1226x5,{"\x69\x76":_0x1226x6,"\x6D\x6F\x64\x65":_0x1226x3[__Oxb227b[0x9]][__Oxb227b[0x8]],"\x70\x61\x64\x64\x69\x6E\x67":_0x1226x3[__Oxb227b[0xb]][__Oxb227b[0xa]]}).toString(_0x1226x3[__Oxb227b[0x5]].Utf8).toString()},"\x42\x61\x73\x65\x36\x34\x45\x6E\x63\x6F\x64\x65":function _0x1226xc(_0x1226x2){var _0x1226x9=_0x1226x3[__Oxb227b[0x5]][__Oxb227b[0x4]][__Oxb227b[0x3]](_0x1226x2);return _0x1226x3[__Oxb227b[0x5]][__Oxb227b[0x10]][__Oxb227b[0xf]](_0x1226x9)},"\x42\x61\x73\x65\x36\x34\x44\x65\x63\x6F\x64\x65":function _0x1226xd(_0x1226x2){return _0x1226x3[__Oxb227b[0x5]][__Oxb227b[0x10]][__Oxb227b[0x3]](_0x1226x2).toString(_0x1226x3[__Oxb227b[0x5]].Utf8)},"\x4D\x64\x35\x65\x6E\x63\x6F\x64\x65":function _0x1226xe(_0x1226x2){return _0x1226x3.MD5(_0x1226x2).toString()},"\x6B\x65\x79\x43\x6F\x64\x65":__Oxb227b[0x2]};const _0x1226xf=function _0x1226x10(_0x1226x2,_0x1226x9){if(_0x1226x2 instanceof  Array){_0x1226x9= _0x1226x9|| [];for(var _0x1226xb=0;_0x1226xb< _0x1226x2[__Oxb227b[0x12]];_0x1226xb++){_0x1226x9[_0x1226xb]= _0x1226x10(_0x1226x2[_0x1226xb],_0x1226x9[_0x1226xb])}}else {!(_0x1226x2 instanceof  Array)&& _0x1226x2 instanceof  Object?(_0x1226x9= _0x1226x9|| {},Object[__Oxb227b[0x15]](_0x1226x2)[__Oxb227b[0x14]]()[__Oxb227b[0x13]](function(_0x1226xb){_0x1226x9[_0x1226xb]= _0x1226x10(_0x1226x2[_0x1226xb],_0x1226x9[_0x1226xb])})):_0x1226x9= _0x1226x2};return _0x1226x9};const _0x1226x11=function _0x1226x12(_0x1226x2){for(var _0x1226x9=[__Oxb227b[0x16],__Oxb227b[0x17]],_0x1226xb=!1,_0x1226x3=0;_0x1226x3< _0x1226x9[__Oxb227b[0x12]];_0x1226x3++){var _0x1226x4=_0x1226x9[_0x1226x3];_0x1226x2[__Oxb227b[0x18]](_0x1226x4)&&  !_0x1226xb&& (_0x1226xb=  !0)};return _0x1226xb};const _0x1226x13=function _0x1226x14(_0x1226x2,_0x1226x9){if(_0x1226x9&& Object[__Oxb227b[0x15]](_0x1226x9)[__Oxb227b[0x12]]> 0){var _0x1226xb=Object[__Oxb227b[0x15]](_0x1226x9)[__Oxb227b[0x13]](function(_0x1226x2){return _0x1226x2+ __Oxb227b[0x1b]+ _0x1226x9[_0x1226x2]})[__Oxb227b[0x1a]](__Oxb227b[0x19]);return _0x1226x2[__Oxb227b[0x1d]](__Oxb227b[0x1c])>= 0?_0x1226x2+ __Oxb227b[0x19]+ _0x1226xb:_0x1226x2+ __Oxb227b[0x1c]+ _0x1226xb};return _0x1226x2};const _0x1226x15=function _0x1226x16(_0x1226x2){for(var _0x1226x9=_0x1226x6,_0x1226xb=0;_0x1226xb< _0x1226x9[__Oxb227b[0x12]];_0x1226xb++){var _0x1226x3=_0x1226x9[_0x1226xb];_0x1226x2[__Oxb227b[0x18]](_0x1226x3)&&  !_0x1226x2[__Oxb227b[0x18]](__Oxb227b[0x1e]+ _0x1226x3)&& (_0x1226x2= _0x1226x2[__Oxb227b[0x1f]](_0x1226x3,__Oxb227b[0x1e]+ _0x1226x3))};return _0x1226x2};var _0x1226x9=_0x1226x2,_0x1226xb=(_0x1226x9[__Oxb227b[0x20]],_0x1226x9[__Oxb227b[0x21]]);_0x1226xb+= (_0x1226xb[__Oxb227b[0x1d]](__Oxb227b[0x1c])>  -1?__Oxb227b[0x19]:__Oxb227b[0x1c])+ __Oxb227b[0x22];var _0x1226x17=function _0x1226x18(_0x1226x2){var _0x1226x9=_0x1226x2[__Oxb227b[0x21]],_0x1226xb=_0x1226x2[__Oxb227b[0x24]],_0x1226x3=void(0)=== _0x1226xb?__Oxb227b[0x25]:_0x1226xb,_0x1226x4=_0x1226x2[__Oxb227b[0x26]],_0x1226x6=_0x1226x2[__Oxb227b[0x20]],_0x1226x19=void(0)=== _0x1226x6?{}:_0x1226x6,_0x1226x1a=_0x1226x3[__Oxb227b[0x27]](),_0x1226x1b=_0x1226x7[__Oxb227b[0x28]],_0x1226x1c=_0x1226x19[__Oxb227b[0x29]]|| _0x1226x19[__Oxb227b[0x2a]]|| __Oxb227b[0x2b],_0x1226x1d=__Oxb227b[0x2b],_0x1226x1e=+ new Date();return _0x1226x1d= __Oxb227b[0x2c]!== _0x1226x1a&& (__Oxb227b[0x2d]!== _0x1226x1a|| __Oxb227b[0x2e]!== _0x1226x1c[__Oxb227b[0x27]]()&& _0x1226x4&& Object[__Oxb227b[0x15]](_0x1226x4)[__Oxb227b[0x12]])?_0x1226x7.Md5encode(_0x1226x7.Base64Encode(_0x1226x7.AesEncrypt(__Oxb227b[0x2b]+ JSON[__Oxb227b[0xf]](_0x1226xf(_0x1226x4))))+ __Oxb227b[0x2f]+ _0x1226x1b+ __Oxb227b[0x2f]+ _0x1226x1e):_0x1226x7.Md5encode(__Oxb227b[0x2f]+ _0x1226x1b+ __Oxb227b[0x2f]+ _0x1226x1e),_0x1226x11(_0x1226x9)&& (_0x1226x9= _0x1226x13(_0x1226x9,{"\x6C\x6B\x73":_0x1226x1d,"\x6C\x6B\x74":_0x1226x1e}),_0x1226x9= _0x1226x15(_0x1226x9)),Object[__Oxb227b[0x23]](_0x1226x2,{"\x75\x72\x6C":_0x1226x9})}(_0x1226x2= Object[__Oxb227b[0x23]](_0x1226x2,{"\x75\x72\x6C":_0x1226xb}));return _0x1226x17}(function(_0x1226x1f,_0x1226xf,_0x1226x20,_0x1226x21,_0x1226x1c,_0x1226x22){_0x1226x22= __Oxb227b[0x30];_0x1226x21= function(_0x1226x19){if( typeof alert!== _0x1226x22){alert(_0x1226x19)};if( typeof console!== _0x1226x22){console[__Oxb227b[0x31]](_0x1226x19)}};_0x1226x20= function(_0x1226x3,_0x1226x1f){return _0x1226x3+ _0x1226x1f};_0x1226x1c= _0x1226x20(__Oxb227b[0x32],_0x1226x20(_0x1226x20(__Oxb227b[0x33],__Oxb227b[0x34]),__Oxb227b[0x35]));try{_0x1226x1f= __encode;if(!( typeof _0x1226x1f!== _0x1226x22&& _0x1226x1f=== _0x1226x20(__Oxb227b[0x36],__Oxb227b[0x37]))){_0x1226x21(_0x1226x1c)}}catch(e){_0x1226x21(_0x1226x1c)}})({})
  // prettier-ignore
  function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}