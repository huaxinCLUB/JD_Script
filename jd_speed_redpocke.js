/*
京东极速版红包
自动提现微信现金
更新时间：2021-5-24
活动时间：2021-4-6至2021-5-30
活动地址：https://prodev.m.jd.com/jdlite/active/31U4T6S4PbcK83HyLPioeCWrD63j/index.html
活动入口：京东极速版-领红包
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京东极速版红包
0 0,22 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_redpocke.js, tag=京东极速版红包, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

================Loon==============
[Script]
cron "0 0,22 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_redpocke.js,tag=京东极速版红包

===============Surge=================
京东极速版红包 = type=cron,cronexp="0 0,22 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_redpocke.js

============小火箭=========
京东极速版红包 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_redpocke.js, cronexpr="0 0,22 * * *", timeout=3600, enable=true
*/

const $ = new Env('京东极速版红包');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '', message;
const linkId = "AkOULcXbUA_8EAPbYLLMgg";
const signLinkId = '9WA12jYGulArzWS7vcrwhw';

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0);
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      console.log(`\n如提示活动火爆,可再执行一次尝试\n`);
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
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
      await jsRedPacket()
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function jsRedPacket() {
  try {
    await invite();
    await sign();//极速版签到提现
    await reward_query();
    for (let i = 0; i < 3; ++i) {
      await redPacket()
      await $.wait(500)
    }
    await getPacketList()
    await showMsg()
  } catch (e) {
    $.logErr(e)
  }
}


function showMsg() {
  return new Promise(resolve => {
    if (message) $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}
async function sign() {
  return new Promise(resolve => {
    const body = {"linkId":signLinkId,"serviceName":"dayDaySignGetRedEnvelopeSignService","business":1};
    const options = {
      url: `https://api.m.jd.com`,
      body: `functionId=apSignIn_day&body=${escape(JSON.stringify(body))}&_t=${+new Date()}&appid=activities_platform`,
      headers: {
        'Cookie': cookie,
        "Host": "api.m.jd.com",
        'Origin': 'https://daily-redpacket.jd.com',
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "User-Agent": "jdltapp;iPhone;3.3.2;14.5.1network/wifi;hasUPPay/0;pushNoticeIsOpen/1;lang/zh_CN;model/iPhone13,2;addressid/137923973;hasOCPay/0;appBuild/1047;supportBestPay/0;pv/467.11;apprpd/MyJD_Main;",
        "Accept-Language": "zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8",
        'Referer': 'https://daily-redpacket.jd.com/?activityId=9WA12jYGulArzWS7vcrwhw',
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = $.toObj(data);
            if (data.code === 0) {
              if (data.data.retCode === 0) {
                message += `极速版签到提现：签到成功\n`;
                console.log(`极速版签到提现：签到成功\n`);
              } else {
                console.log(`极速版签到提现：签到失败:${data.data.retMessage}\n`);
              }
            } else {
              console.log(`极速版签到提现：签到异常:${JSON.stringify(data)}\n`);
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
function reward_query() {
  return new Promise(resolve => {
    $.get(taskGetUrl("spring_reward_query", {
      "inviter": "ZkwcpLegNlzAaWJFNT0DOIjvAArnAKULplIlLRGdC%2B0%3D",
      linkId
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {

            } else {
              console.log(data.errMsg)
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
async function redPacket() {
  return new Promise(resolve => {
    $.get(taskGetUrl("spring_reward_receive",{"inviter":"ZkwcpLegNlzAaWJFNT0DOIjvAArnAKULplIlLRGdC%2B0%3D",linkId}),
        async (err, resp, data) => {
          try {
            if (err) {
              console.log(`${JSON.stringify(err)}`)
              console.log(`${$.name} API请求失败，请检查网路重试`)
            } else {
              if (safeGet(data)) {
                data = JSON.parse(data);
                if (data.code === 0) {
                  if (data.data.received.prizeType !== 1) {
                    message += `获得${data.data.received.prizeDesc}\n`
                    console.log(`获得${data.data.received.prizeDesc}`)
                  } else {
                    console.log("获得优惠券")
                  }
                } else {
                  console.log(data.errMsg)
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

function getPacketList() {
  return new Promise(resolve => {
    $.get(taskGetUrl("spring_reward_list",{"pageNum":1,"pageSize":100,linkId,"inviter":""}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              for(let item of data.data.items.filter(vo => vo.prizeType===4)){
                if(item.state===0){
                  console.log(`去提现${item.amount}微信现金`)
                  message += `提现${item.amount}微信现金，`
                  await cashOut(item.id,item.poolBaseId,item.prizeGroupId,item.prizeBaseId)
                }
              }
            } else {
              console.log(data.errMsg)
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
function cashOut(id,poolBaseId,prizeGroupId,prizeBaseId,) {
  let body = {
    "businessSource": "SPRING_FESTIVAL_RED_ENVELOPE",
    "base": {
      "id": id,
      "business": null,
      "poolBaseId": poolBaseId,
      "prizeGroupId": prizeGroupId,
      "prizeBaseId": prizeBaseId,
      "prizeType": 4
    },
    linkId,
    "inviter": ""
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("apCashWithDraw",body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            console.log(`提现零钱结果：${data}`)
            data = JSON.parse(data);
            if (data.code === 0) {
              if (data['data']['status'] === "310") {
                console.log(`提现成功！`)
                message += `提现成功！`;
              } else {
                console.log(`提现失败：${data['data']['message']}`);
                message += `提现失败：${data['data']['message']}`;
              }
            } else {
              console.log(`提现异常：${data['errMsg']}`);
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

var _0xod1='jsjiami.com.v6',_0x56eb=[_0xod1,'DMKAPsOGwqw=','wpo7YsK5wrE=','w6rDlMK5w5Vsw68IaRpzLkXCqCBqwqfCnA9WasKhKnLCh8O4w5HDr8O7a2PDnzzDnMObe8O2w7TCuFzDscKHYcOZwookw4HDkMOiwoUDw5/ClcK4wq3DhAXCgMOUwrHDgSlZSMOVK0nCpGdOw6DDsEHDr8O7NMOOD2/DtS3DnsKgwrzDjMOZw7heMsOSw5vCmjbCm28=','w5vDgMOEZUVQXhZzS8KLwqlWZMOKw6kSw4zCssKzcsK3d3LDmBPClxvDoQjDrsKgwpoAw6F2A3jCvCzCv8KSwp3CrsKCZsOswrXCmD4qJsOXFVBGMFnCg8Ogw5kiwrzDlVhwByTCgcKmwqTDhHhgf8OOKG4uwqhowoPCkhPDgBhpWS/CrFEpwo7DjsKjwqQ/IMKEwrvCiwnDg8KTJjXDkXAPwoEyCMKGwrTCrFdHwprDqsKwGX7CuUMxEWoWWWwNT8O6UljDnkfDmMKSZD98w6bCgcOQw6cXwqrCvRjDi8K9G8Kewo/ClsOQwqsjE8OYwrEpQMOcwrDDkcKjHA06LnDCpVTDk8Kbw71YwpZ2w5jCh8OQIn8CwovCrlJwwrvClsOIwr3DisOcBnALciEjPRsGOsKqwrXDiMOycMKRwopgwpbCnDwhw6gXw7vDnsKmw4bDv8OLw7nCn0jDsU3CpcKrwqN7wq8gwqFhwo9WVRnDq8KLwrLCmsKHHx7CjMKfDMKfwpvCsxg/w4nDsFNSIE3CqMO9','YsKUw6hL','w5RpIFNu','w45jG0tQ','U8K+w5d6w5g=','wpXCg8KBQ19D','XU4fJ8K5','Y8OWb3dn','w59gLlVw','TMKCwro=','DMOdwqEy','w7sIUTLor7zms6flpI/otJPvvLborJ3moZDmnZXnvKbotInphoforLg=','wowtwqfChhA=','wonCjcKUdUg=','w5nChsK2E8KbWA==','w6jDk8K/w5xw','w4tAwp9CwoE=','Yjxbwosk','PsKPKUoGUcKww6/DkjJAw54=','LUIhNEnDoMOjw4PCr2nDs3lfWUnDnWDCiEjCricIw5bCpDfCu8OBw6QAwqBQw5JW','wpjCnMKWakRSUQx/SMOHwrwfZcKfw6oKworCscKyIsOgeCXChl3ClAfDrQnDvsKgwpA=','wqYVXcKswqvDvCdCK1zDixfChcKVSMO0FMK5w4bCrcOralh3woc=','L8OiQ8K2YA==','dMKzLMOk','bMKeewxKwprCoMOiWlnCnMKGwprDnMKSwoQswoDDvGNCMRfDjcK8w71ENFdFw5/Dlj4Vw4J8A17DnsKBNStvwrLCrkXCg8KUAsK4w5HCv3dxLsO3w4nCucKiVyAfMiDCqD7DrMOVCGPCkV4fw5XDrcKtISxdwqzCuMOyw7PCmcO3cxFmL8Ozd8OPw6UawofCvsOvw5nDh8KuwqhzD1XDp09PwpzCtFg5wr5oSS4fwoDDvsO8FsKlI2tcdwowN8K3woXCh0HCncK9d8Oyw4TDssO3GkjCjwwPIcOjP8O/XkrCrMKaRCU=','w7zCmMK5acOTwqoOOjo=','KFfCj8ODPcKawpzCpHXDr8K/SS/CjThcNCJ5w7HCvls8Wg==','wpzDncObwoHDvA==','wobDpQXClsOH','w5VjDVZ4','QsOvelRE','w48yw6bCqD8=','ScKewpN6w5bDuA==','HSw3','wpnCtsKdw5TDkMKGw6bDi3jCnzYcw6k=','QQTCqg==','w7XCocOiwpvCmFfDmcKGMVDCiMOxw7Q=','EEjClcOGHA==','IAxiw55C','wqzCv8KjVHJwdz1Ycw==','w5LCjMKlMsKIXhs=','fcKWHcOvw7I=','wrPDlsObwo/DqcKFw7s=','w7bCn8K1HMKc','wqRSwp9NWg==','I8OWwoXDtijCpUVnwq7Dn8K+w4pkwq8NUT3ClcKvBRRbwo7CszXCo8KvI37CgXlhw6p3w4TCrMKe','LsKsJcOwwqHCnh1mFMOoN3Ybw7hlwpISCsOmw5kcwpPCv8O7w7tWw4FVPmvDtsONw5bCjFNewr1Nw5lLXsOvYBnDg8OfwoA5w6vCocKvwop+BlfDlW9sQz7CgVDDjMKNw45WwpgLwqFgw51Bw7xEwrZPMcKOeG5cwqbClsOhwpfCrVPCpsO1cCtzw50WPjMIwqBpaH9LHMKZAMKRw6TChDJxwqlAw5LDjA==','wp4KR8Kpwoo=','DsKpZiJVGAxNBMOrw49Hw6/DocK8woxEwqDDumwCNWrDssKCSMKKe3TDmQ9uPHbCscK5wpbDqnbCqcK0wpxM','TcKPfsOd','ZHQgw7Zy','AsOLwrVFwr4=','C8Opwqc/Yg==','wrcmZg==','wpXDvcOlwr0=','w5wNwoXCvOiuguazlOWmkOi0ie+/jeissuaguuaevee8tui2kemGgOivvg==','XMKtw6XDhsKA','w496w7M=','McKjwpDDtQ==','OMK4OcOgwrA=','HcKFw7bCtsOowqU=','w6vChsOzwqbCpQ==','w71kPHRW','JknCnMOgKg==','cWcwCcKm','KMOBwr1awq0=','w5wXw6HCsw4=','OcORwrrDqjw=','UwM1w6hJ','N8K2wonDoEbCucOFwqnDi3XDm8ORwrIww5DDlkbCl252Gi5ewpjCsy1Sw63DnMKIfsKqw7TCrcK8w43DlTFgwol3E2rDrsKXw6spLsOgQcKxwo3Dpz3Dv8KGDFjDswI=','w6k6w7bCrAEAMnHCoBDDg13Cq8OLwpDDj8KQw7siwrVewqFbScKIwqjClMOJwq9Sw6UcwoTDgHXCjcK6fcKYw73CkxFpwo/DtsOxw6U2wr0xB8ONEcKMSHl0w7EFMic3UnnDmlnClMO7F2RkZMK7EHYHw4QawpITBcKVw60ZwpN2LsKMGhB0PgTCvcOCZRcKw4vDlWnDlsKhwpQ2w4TCgWjCk2R6wrbCpHXChsK7I8Krw59iaUDDusKIaXHCq1LDhMOIRARWw6nDrB/Du0xpE8OPw6hde8KtBMOVw4LCnhAKWMKHwpUlXA==','DMO9wr86WA==','w6TCn8ORw68P','AmYlFno=','GMO/wqQYUg==','FsKPw6U=','woUmwrjCojA=','MsKWwozDilQ=','w7PCpMKyHcKo','wp8Lc8Kdwqs=','w6B0w51DYQ==','wp5CwqA=','TsOWbXo=','YGLCq8O66K655rOi5aaC6Lau77yY6K2o5qCW5p6C57yT6LWM6Yaf6K+t','cTjCiDDCtw==','BMKqGsOAwqQ=','w69mw4Vecw==','w6jDgMKjw5dfw6MT','w5PCu8KsS8Om','LMK4P8OywpLCkgY=','w7/ChwvDuFpO','IUYAOmk=','wrfChMK2w6DDhMKmw4A=','c8OHZXpZ','J8KRcQdKwpM=','O8KjwonDsXLDpsKe','W8OkLSI=','WcKvw5/DscKM','wqnDqSXChw==','XsKXfcO9Rw==','w4g6w6s=','w4o0w6HCoA==','DMOEFB/or5vmsKrlpZjotYrvvLLorK3mobLmn5/nvpjota/phIHorKk=','J8ONwpbDgynDrQ==','wpjDhS/CuMO2','w5rCosOuwpTCvw==','WcOhHMOaw6A=','JMK2LA==','LkLClsOW','dWvCpsOh6K215rGc5aae6Le677616K6q5qKT5pyW572V6LSv6YSq6Kyf','wpAjwrLCsAfDpA==','SGIGw6t4','W8O1GsOOw60=','wpsIwoDCuww=','w7vCt8K8bcOk','YsKaw6lMw4c=','wowabQJS','wrfDmMOXwqDDgQ==','RsK1w4/DucKd','d8Ktw6lLw5E=','wqTCiQ7DtMK6','AcOhOMKURQ==','W8KYYMOAQg==','wp49wqXClxw=','f8KSF8OBw54=','SMODdG9OIkzCvcKkXcOxECMZwpxkw4sMI8K2w5/CqcKjwppiwpl1QcKkTwjCripkwokSw47Di1bCgsKRUMK9wrHCtlnCpQnChz5cGnkxwpzDvVjCsCcmwoM=','YcOqPj9ABAhAC8O0woIaw6HDqcKcwpRCwqrCojpDBFHDgsOWDMKucmjDnEcmRgPDpMO9w4zDkXnDkMOYw4gdw7XDj8Oww4lJwrkAFGt4w5p2w7BPwpXCnwNAw4R9w4RvH2LChVRIc8OwwprDtG3DqMKnw4k8cxTDt3lfYsOJwp3CocK3w6Yiwq3DsMOMW0Ecw7HCtMOiIMOEw4xMFR9NSMOowpbCqT1idMKEwqTDrMO7b8Kqwo/Csy8EXcKdwp7CssKfw5dvw7p9w6xtwp7Dki3DnDHCn2NZwr3CmzEuw6xaA8Kmw6HDmCrDugs=','w4zCmMKHHcK+','w7TChxE=','Ey8tG8Oe','QsK8wq9kw5Y=','QsOUQktx','d8K1VcOuVA==','w7jDpsK5w5B5','OUXCkQ==','OS53w4I=','woRbwqBu6Ky85rCi5aeY6LWN776n6Ky15qCZ5p+k57676Ley6YSj6KyU','GQgTMcON','wplzwoRdeQ==','cjrCqijCoA==','J8ONwpY=','wrrDksOCwo4=','BCvCjDborJvmsqXlp4HotrHvv6rorLPmoaPmnL3nv5votJ/pho/orKU=','Jy5ow5RA','ZHYHw5NXwoBI','PsK1EiIR','RMKMwql0w7XDuBQ=','w5PCl8OTwqnCv3o=','w7VKwr1qwog=','w4A0w7jCpCoJJw==','HsO+wr5owpg=','HcKPw7/ClMOuwr8=','w7HCl8O5wrfCng==','acObGsOFw5k=','woLCkzDDl8K0','wrDDqSHClg==','wrPCozXDluivmeaxpOWmlui3je+/veiupeaggeaciue9kui2tumEkOiusQ==','L8ODwoXDpxzDuh4=','RzU9w4JA','O1M4LA==','R3wqw6JH','PsKTdQRt','KMOSwrzDlRE=','wp0KfsKfwr4=','RMKJVcOORA==','QMKjw7DDsMKXw4I=','wq5pwqBMTw==','wpcQe8K3wrQ=','wq/CjzPDmcKQ','SAXCuzrCnsKV','W8K8w5PDrcKx','w7nCmcKoRcOVwr0=','w73CtMKHTMOf','w53CgMOAw7E3','w6l8wp92wpE=','wqsqUB9B','XMKQZMKHXX4pG8OKcMK2ag==','wrLClcKyw63DqsKgw5XDoFDCtx19w5dowqc3w47ClBQgwoBlwqHDuSbDtlcaw5l/w5g+wog=','dTUow4tNw7TDkMOfw6TDoTLCiMKVTsKERcK8w4o4wq5KDcKyelV9CMKcwrsdw4YeZA==','RMK4w6PDhcKWworDrVJqGMOewpIAw67Do2JLwprCsjlfLhhSFXVVwoY=','wrQJBMK/wrY=','w5Jjwp/CpirDg8OyacKTwprCux8iMBl4','wrh+wpLDnQ==','w57ChsKCallQQAgtTsO5w7IDc8ObwrNMwonDp8OmYcK5e2TDj1/ClB3DuQnDqMKuw5sTw4F+AzfCojfCpMKPwoTCscOBc8O7wrnDlWMkPcOiElEPdWjDrsKYw4hLworCnA15PXnDhcKDwqvCnHkkCsKeeX8Dw4w7wr/DllrDgyReUTLCqWZ/w7PDqMK7w5xweMKHwqfDkWHCs8O8aXrDjnIdwqInVcOXworCrktFw4jCm8OmXyfClA5WMUgYU3ZfJcKaLSjCmUPCqMOrfik0wqfClsOqw4snwrbCoifDl8K7AsOJ','wrM9dQt4wp8RGVPChMOmw5kDwoNnwp/CgcOxBDYsesKEOglzw64ow6s=','TQTCqhbCmMKCwoLDncKC','w73CgsK7cMOUw7VTXD/DqsOMw7gpwoXCvGRdw67CqMK4VWlYEQ==','w6fCqCvDqns=','wp/DvcObwpnDnQ==','NislIMOW','GWzCo8Oqw4E=','DXrCtsO7NA==','w4pmw5piZgM=','wp7DssO+','XhYHw7J3w5LDo8O0w4zDiRnDqcK5','w5rCnMOL','B8OdwoRYwq/ClSohwrQiw7nCqsKS','w7HCpx3DtUw=','BMOAN8K5eg==','wqPCrSTDoMKjV2DDrcKgwrA=','w7TChxHDu09Sw4Y=','LMK5ZzFJ','w4Mww7jCoQwYMg==','wrTCqMK6w5DDtA==','EjsjiyUhaGPmi.RcTxom.v6ZngxuG=='];(function(_0x2832d7,_0xd37520,_0x118b1b){var _0x5af025=function(_0x4fed39,_0x2cba0e,_0x1d6395,_0x3594f5,_0x5bb0e3){_0x2cba0e=_0x2cba0e>>0x8,_0x5bb0e3='po';var _0x294017='shift',_0x1f95be='push';if(_0x2cba0e<_0x4fed39){while(--_0x4fed39){_0x3594f5=_0x2832d7[_0x294017]();if(_0x2cba0e===_0x4fed39){_0x2cba0e=_0x3594f5;_0x1d6395=_0x2832d7[_0x5bb0e3+'p']()}else if(_0x2cba0e&&_0x1d6395['replace'](/[EyUhGPRTxZngxuG=]/g,'')===_0x2cba0e){_0x2832d7[_0x1f95be](_0x3594f5)}}_0x2832d7[_0x1f95be](_0x2832d7[_0x294017]())}return 0x839d7};var _0x59f316=function(){var _0x177d47={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x1486cb,_0x23f716,_0x472223,_0x135b2c){_0x135b2c=_0x135b2c||{};var _0x46a231=_0x23f716+'='+_0x472223;var _0x4a2577=0x0;for(var _0x4a2577=0x0,_0x35da0b=_0x1486cb['length'];_0x4a2577<_0x35da0b;_0x4a2577++){var _0x5f34d7=_0x1486cb[_0x4a2577];_0x46a231+=';\x20'+_0x5f34d7;var _0x34f94c=_0x1486cb[_0x5f34d7];_0x1486cb['push'](_0x34f94c);_0x35da0b=_0x1486cb['length'];if(_0x34f94c!==!![]){_0x46a231+='='+_0x34f94c}}_0x135b2c['cookie']=_0x46a231},'removeCookie':function(){return'dev'},'getCookie':function(_0x923aa3,_0xefbef9){_0x923aa3=_0x923aa3||function(_0x2bce03){return _0x2bce03};var _0x4c70d7=_0x923aa3(new RegExp('(?:^|;\x20)'+_0xefbef9['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x3ee9b9=typeof _0xod1=='undefined'?'undefined':_0xod1,_0x512f30=_0x3ee9b9['split'](''),_0x284a62=_0x512f30['length'],_0x3734c5=_0x284a62-0xe,_0x1c7f03;while(_0x1c7f03=_0x512f30['pop']()){_0x284a62&&(_0x3734c5+=_0x1c7f03['charCodeAt']())}var _0x53cbdf=function(_0x4b470d,_0x5ec16d,_0x5336f0){_0x4b470d(++_0x5ec16d,_0x5336f0)};_0x3734c5^-_0x284a62===-0x524&&(_0x1c7f03=_0x3734c5)&&_0x53cbdf(_0x5af025,_0xd37520,_0x118b1b);return _0x1c7f03>>0x2===0x14b&&_0x4c70d7?decodeURIComponent(_0x4c70d7[0x1]):undefined}};var _0x2c722b=function(){var _0x554432=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x554432['test'](_0x177d47['removeCookie']['toString']())};_0x177d47['updateCookie']=_0x2c722b;var _0xe1adf4='';var _0x8a88c0=_0x177d47['updateCookie']();if(!_0x8a88c0){_0x177d47['setCookie'](['*'],'counter',0x1)}else if(_0x8a88c0){_0xe1adf4=_0x177d47['getCookie'](null,'counter')}else{_0x177d47['removeCookie']()}};_0x59f316()}(_0x56eb,0x17e,0x17e00));var _0x3bfe=function(_0x3274a2,_0x5549c7){_0x3274a2=~~'0x'['concat'](_0x3274a2);var _0x5c0040=_0x56eb[_0x3274a2];if(_0x3bfe['tXqoBm']===undefined){(function(){var _0x39eb92=function(){var _0x292d12;try{_0x292d12=Function('return\x20(function()\x20{}.constructor(\x22return\x20this\x22)(\x20));')()}catch(_0x486356){_0x292d12=window}return _0x292d12};var _0xe218fd=_0x39eb92();var _0x5c55a8='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xe218fd['atob']||(_0xe218fd['atob']=function(_0x14cf92){var _0xcd3e1f=String(_0x14cf92)['replace'](/=+$/,'');for(var _0x2b51c8=0x0,_0x310651,_0x50e1d9,_0x3b0362=0x0,_0x173c82='';_0x50e1d9=_0xcd3e1f['charAt'](_0x3b0362++);~_0x50e1d9&&(_0x310651=_0x2b51c8%0x4?_0x310651*0x40+_0x50e1d9:_0x50e1d9,_0x2b51c8++%0x4)?_0x173c82+=String['fromCharCode'](0xff&_0x310651>>(-0x2*_0x2b51c8&0x6)):0x0){_0x50e1d9=_0x5c55a8['indexOf'](_0x50e1d9)}return _0x173c82})}());var _0x2b39a1=function(_0x3d80bc,_0x5549c7){var _0xa7f5b2=[],_0x1a991a=0x0,_0x467a82,_0x4009c5='',_0x1350bb='';_0x3d80bc=atob(_0x3d80bc);for(var _0x4bef54=0x0,_0x5d13c8=_0x3d80bc['length'];_0x4bef54<_0x5d13c8;_0x4bef54++){_0x1350bb+='%'+('00'+_0x3d80bc['charCodeAt'](_0x4bef54)['toString'](0x10))['slice'](-0x2)}_0x3d80bc=decodeURIComponent(_0x1350bb);for(var _0x5a470c=0x0;_0x5a470c<0x100;_0x5a470c++){_0xa7f5b2[_0x5a470c]=_0x5a470c}for(_0x5a470c=0x0;_0x5a470c<0x100;_0x5a470c++){_0x1a991a=(_0x1a991a+_0xa7f5b2[_0x5a470c]+_0x5549c7['charCodeAt'](_0x5a470c%_0x5549c7['length']))%0x100;_0x467a82=_0xa7f5b2[_0x5a470c];_0xa7f5b2[_0x5a470c]=_0xa7f5b2[_0x1a991a];_0xa7f5b2[_0x1a991a]=_0x467a82}_0x5a470c=0x0;_0x1a991a=0x0;for(var _0x5b1f6c=0x0;_0x5b1f6c<_0x3d80bc['length'];_0x5b1f6c++){_0x5a470c=(_0x5a470c+0x1)%0x100;_0x1a991a=(_0x1a991a+_0xa7f5b2[_0x5a470c])%0x100;_0x467a82=_0xa7f5b2[_0x5a470c];_0xa7f5b2[_0x5a470c]=_0xa7f5b2[_0x1a991a];_0xa7f5b2[_0x1a991a]=_0x467a82;_0x4009c5+=String['fromCharCode'](_0x3d80bc['charCodeAt'](_0x5b1f6c)^_0xa7f5b2[(_0xa7f5b2[_0x5a470c]+_0xa7f5b2[_0x1a991a])%0x100])}return _0x4009c5};_0x3bfe['uHndJQ']=_0x2b39a1;_0x3bfe['ZcCYnS']={};_0x3bfe['tXqoBm']=!![]}var _0x1e651e=_0x3bfe['ZcCYnS'][_0x3274a2];if(_0x1e651e===undefined){if(_0x3bfe['LRJFPc']===undefined){var _0x48e4f2=function(_0x33546c){this['AyAJrR']=_0x33546c;this['OEsrLo']=[0x1,0x0,0x0];this['QATsEf']=function(){return'newState'};this['MSuwmc']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['tNsOHf']='[\x27|\x22].+[\x27|\x22];?\x20*}'};_0x48e4f2['prototype']['JlVDrU']=function(){var _0xdd8667=new RegExp(this['MSuwmc']+this['tNsOHf']);var _0x17fa09=_0xdd8667['test'](this['QATsEf']['toString']())?--this['OEsrLo'][0x1]:--this['OEsrLo'][0x0];return this['STADWZ'](_0x17fa09)};_0x48e4f2['prototype']['STADWZ']=function(_0x5a29dc){if(!Boolean(~_0x5a29dc)){return _0x5a29dc}return this['MuqDng'](this['AyAJrR'])};_0x48e4f2['prototype']['MuqDng']=function(_0x2d4143){for(var _0xedfe39=0x0,_0x1827d8=this['OEsrLo']['length'];_0xedfe39<_0x1827d8;_0xedfe39++){this['OEsrLo']['push'](Math['round'](Math['random']()));_0x1827d8=this['OEsrLo']['length']}return _0x2d4143(this['OEsrLo'][0x0])};new _0x48e4f2(_0x3bfe)['JlVDrU']();_0x3bfe['LRJFPc']=!![]}_0x5c0040=_0x3bfe['uHndJQ'](_0x5c0040,_0x5549c7);_0x3bfe['ZcCYnS'][_0x3274a2]=_0x5c0040}else{_0x5c0040=_0x1e651e}return _0x5c0040};var _0x2b564e=function(){var _0x27ecf1=!![];return function(_0x5f54bb,_0x283075){var _0xcdad7a=_0x27ecf1?function(){if(_0x283075){var _0x35920e=_0x283075['apply'](_0x5f54bb,arguments);_0x283075=null;return _0x35920e}}:function(){};_0x27ecf1=![];return _0xcdad7a}}();var _0x10789c=_0x2b564e(this,function(){var _0x3066c2=function(){return'\x64\x65\x76'},_0x2f7153=function(){return'\x77\x69\x6e\x64\x6f\x77'};var _0x77d1e2=function(){var _0x51147d=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x51147d['\x74\x65\x73\x74'](_0x3066c2['\x74\x6f\x53\x74\x72\x69\x6e\x67']())};var _0x6ec7e8=function(){var _0x1023cd=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x1023cd['\x74\x65\x73\x74'](_0x2f7153['\x74\x6f\x53\x74\x72\x69\x6e\x67']())};var _0xbabc42=function(_0xe101dc){var _0x303598=~-0x1>>0x1+0xff%0x0;if(_0xe101dc['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x303598)){_0x2f1572(_0xe101dc)}};var _0x2f1572=function(_0x228921){var _0x1a24e3=~-0x4>>0x1+0xff%0x0;if(_0x228921['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x1a24e3){_0xbabc42(_0x228921)}};if(!_0x77d1e2()){if(!_0x6ec7e8()){_0xbabc42('\x69\x6e\x64\u0435\x78\x4f\x66')}else{_0xbabc42('\x69\x6e\x64\x65\x78\x4f\x66')}}else{_0xbabc42('\x69\x6e\x64\u0435\x78\x4f\x66')}});_0x10789c();function wuzhi01(_0x207413){var _0x29d60b={'Ybhvs':function(_0x9bb266,_0x30d968){return _0x9bb266===_0x30d968},'ChSnM':_0x3bfe('0','i$e3'),'AELEz':_0x3bfe('1','xQVF'),'jPEEP':function(_0x34c4b8,_0x135a7e){return _0x34c4b8!==_0x135a7e},'CaohZ':_0x3bfe('2','(2#('),'Rkfpm':_0x3bfe('3','Qo]2'),'drhjh':function(_0x1f7b5a){return _0x1f7b5a()},'tJNuU':_0x3bfe('4','7HwZ'),'daSAH':_0x3bfe('5','XEMZ'),'NidWa':_0x3bfe('6','ICf^'),'LFUBC':_0x3bfe('7','sP2i'),'MYMHz':_0x3bfe('8','OKiH'),'bExjb':function(_0x4971ac,_0xe8fa0a){return _0x4971ac(_0xe8fa0a)},'QJYlt':_0x3bfe('9','c@]k'),'gMxQw':_0x3bfe('a','$UE)'),'DYuUy':_0x3bfe('b','k@Wl'),'TZKei':_0x3bfe('c','Qo]2')};return new Promise(_0x4be7b1=>{let _0x544c28=+new Date();let _0xf826aa=_0x207413[_0x3bfe('d','5F[J')];let _0x188588={'url':_0x3bfe('e','i$e3')+ +new Date(),'headers':{'Host':_0x29d60b[_0x3bfe('f','UuGW')],'accept':_0x29d60b[_0x3bfe('10','xBLT')],'content-type':_0x29d60b[_0x3bfe('11','v58%')],'origin':_0x29d60b[_0x3bfe('12','YTBE')],'accept-language':_0x29d60b[_0x3bfe('13','Xu%$')],'user-agent':$[_0x3bfe('14','cpkq')]()?process[_0x3bfe('15','xBLT')][_0x3bfe('16','ICf^')]?process[_0x3bfe('17','DywT')][_0x3bfe('18','k[Fu')]:_0x29d60b[_0x3bfe('19','UuGW')](require,_0x29d60b[_0x3bfe('1a','!$5i')])[_0x3bfe('1b','D@%[')]:$[_0x3bfe('1c','UuGW')](_0x29d60b[_0x3bfe('1d','wfE[')])?$[_0x3bfe('1e','@!!J')](_0x29d60b[_0x3bfe('1f','XEMZ')]):_0x29d60b[_0x3bfe('20','aptw')],'referer':_0x29d60b[_0x3bfe('21','OKiH')],'Cookie':cookie},'body':_0x3bfe('22','NwUq')+_0xf826aa+_0x3bfe('23','k@Wl')+_0x544c28};$[_0x3bfe('24','g&Qz')](_0x188588,(_0x3a899e,_0x503454,_0x1ffce3)=>{if(_0x29d60b[_0x3bfe('25','Egol')](_0x29d60b[_0x3bfe('26','Egol')],_0x29d60b[_0x3bfe('27','g&Qz')])){$[_0x3bfe('28','k@Wl')](e,resp)}else{try{if(_0x3a899e){if(_0x29d60b[_0x3bfe('29','B*[A')](_0x29d60b[_0x3bfe('2a','VhgQ')],_0x29d60b[_0x3bfe('2b','Egol')])){console[_0x3bfe('2c','RZ7i')]($[_0x3bfe('2d','luH5')]+_0x3bfe('2e','Qo]2'))}else{_0x1ffce3=JSON[_0x3bfe('2f','c@]k')](_0x1ffce3)}}else{_0x1ffce3=JSON[_0x3bfe('30','k@Wl')](_0x1ffce3)}}catch(_0x34643a){$[_0x3bfe('31','Ytz2')](_0x34643a,resp)}finally{_0x29d60b[_0x3bfe('32','NwUq')](_0x4be7b1)}}})})}function wuzhi02(_0x4fc947){var _0x4e9c94={'dcSDb':function(_0x1a98f0,_0x2a6eee){return _0x1a98f0===_0x2a6eee},'OEnHB':_0x3bfe('33','(2#('),'iUkhy':_0x3bfe('34',']45D'),'TtNhn':function(_0x18aa11){return _0x18aa11()},'gASYi':_0x3bfe('35','BlOm'),'XmIep':_0x3bfe('36',')^Sa'),'XhEse':_0x3bfe('37','k@Wl'),'bXzKy':_0x3bfe('38','OKiH'),'kgjmR':_0x3bfe('39','!$5i'),'PknuR':function(_0x5a0464,_0x244cb3){return _0x5a0464(_0x244cb3)},'wCxyg':_0x3bfe('9','c@]k'),'CvdJu':_0x3bfe('3a','KN6d'),'kqmGo':_0x3bfe('3b','wfE[')};return new Promise(_0x467f49=>{let _0x3f9080=+new Date();let _0x5b4c0c=_0x4fc947[_0x3bfe('3c','i$e3')];let _0x2c70be={'url':_0x3bfe('3d','Xu%$')+ +new Date(),'headers':{'Host':_0x4e9c94[_0x3bfe('3e','xBLT')],'accept':_0x4e9c94[_0x3bfe('3f','wLIy')],'content-type':_0x4e9c94[_0x3bfe('40','Egol')],'origin':_0x4e9c94[_0x3bfe('41','VhgQ')],'accept-language':_0x4e9c94[_0x3bfe('42','@!!J')],'user-agent':$[_0x3bfe('43','RZ7i')]()?process[_0x3bfe('44','v58%')][_0x3bfe('45','XEMZ')]?process[_0x3bfe('46','5F[J')][_0x3bfe('47','DywT')]:_0x4e9c94[_0x3bfe('48','Xu%$')](require,_0x4e9c94[_0x3bfe('49','GFfn')])[_0x3bfe('4a','k@Wl')]:$[_0x3bfe('4b','Ytz2')](_0x4e9c94[_0x3bfe('4c','KN6d')])?$[_0x3bfe('4d','Jny$')](_0x4e9c94[_0x3bfe('4e','Ytz2')]):_0x4e9c94[_0x3bfe('4f','hCv^')],'referer':_0x3bfe('50','W%dW')+_0x5b4c0c,'Cookie':cookie},'body':_0x3bfe('51','aptw')+_0x4e9c94[_0x3bfe('52','OKiH')](escape,_0x5b4c0c)+_0x3bfe('53','m1Fr')+_0x3f9080};$[_0x3bfe('54','7HwZ')](_0x2c70be,(_0x101806,_0x28666e,_0x1c1707)=>{try{if(_0x101806){if(_0x4e9c94[_0x3bfe('55','AbZ(')](_0x4e9c94[_0x3bfe('56','k[Fu')],_0x4e9c94[_0x3bfe('57','luH5')])){if(_0x101806){console[_0x3bfe('58','Qo]2')]($[_0x3bfe('59','xBLT')]+_0x3bfe('5a','c@]k'))}else{_0x1c1707=JSON[_0x3bfe('5b','sP2i')](_0x1c1707)}}else{console[_0x3bfe('5c','cpkq')]($[_0x3bfe('5d','x#T@')]+_0x3bfe('5a','c@]k'))}}else{_0x1c1707=JSON[_0x3bfe('5e','aptw')](_0x1c1707)}}catch(_0x29cbd3){$[_0x3bfe('5f','9ya6')](_0x29cbd3,resp)}finally{_0x4e9c94[_0x3bfe('60','DywT')](_0x467f49)}})})}function invite(){var _0x5370cf={'FMcKA':function(_0x389036,_0x5611f6){return _0x389036!==_0x5611f6},'QjZAs':_0x3bfe('61','Egol'),'CaINc':_0x3bfe('62','Xu%$'),'fjaps':function(_0x55ee7e,_0x58f9b0){return _0x55ee7e===_0x58f9b0},'LsQSq':_0x3bfe('63','B*[A'),'mtQbI':function(_0x1b5fa6,_0x12840f){return _0x1b5fa6<_0x12840f},'ucHDi':function(_0x1739ca,_0x40b17c){return _0x1739ca(_0x40b17c)},'cwpTw':function(_0x20c45b){return _0x20c45b()},'ePSZt':_0x3bfe('64','k[Fu'),'HuuYh':function(_0x494dc3,_0xc99623){return _0x494dc3===_0xc99623},'gDUNy':_0x3bfe('65','@!!J'),'nAsmC':function(_0x4361ba){return _0x4361ba()},'PqtMq':function(_0x637a9b,_0x7b33d){return _0x637a9b!==_0x7b33d},'NTtNZ':_0x3bfe('66','W%dW'),'zChOI':_0x3bfe('67','ICf^'),'yjmWE':_0x3bfe('68','x#T@'),'mTqZa':_0x3bfe('69','@!!J')};return new Promise(_0x193c27=>{var _0x108123={'WSlyY':function(_0x4c2d94){return _0x5370cf[_0x3bfe('6a','luH5')](_0x4c2d94)}};if(_0x5370cf[_0x3bfe('6b','xQVF')](_0x5370cf[_0x3bfe('6c',')^Sa')],_0x5370cf[_0x3bfe('6d','luH5')])){$[_0x3bfe('6e','9ya6')]({'url':_0x5370cf[_0x3bfe('6f','c@]k')],'headers':{'User-Agent':_0x5370cf[_0x3bfe('70','x#T@')]}},async(_0x426a75,_0x5da2a2,_0x20c35a)=>{try{if(_0x5370cf[_0x3bfe('71','Ytz2')](_0x5370cf[_0x3bfe('72','OKiH')],_0x5370cf[_0x3bfe('73','cpkq')])){if(_0x426a75){console[_0x3bfe('74','$UE)')]($[_0x3bfe('75','VhgQ')]+_0x3bfe('76','Xu%$'))}else{if(_0x5370cf[_0x3bfe('77','z]gg')](_0x5370cf[_0x3bfe('78','aptw')],_0x5370cf[_0x3bfe('79','cpkq')])){$[_0x3bfe('7a','NwUq')]=JSON[_0x3bfe('5e','aptw')](_0x20c35a);if(_0x5370cf[_0x3bfe('7b','i$e3')]($[_0x3bfe('7c','aptw')][_0x3bfe('7d','UuGW')],0x0)){for(let _0x2224f7=0x0;_0x5370cf[_0x3bfe('7e',')^Sa')](_0x2224f7,$[_0x3bfe('7f','XEMZ')][_0x3bfe('80','VhgQ')][_0x3bfe('81','wfE[')]);_0x2224f7++){let _0x14e70d=$[_0x3bfe('82','x#T@')][_0x3bfe('80','VhgQ')][_0x2224f7];await $[_0x3bfe('83','m1Fr')](0x1f4);await _0x5370cf[_0x3bfe('84','sP2i')](wuzhi01,_0x14e70d)}await $[_0x3bfe('85','wLIy')](0x1f4);await _0x5370cf[_0x3bfe('86','7HwZ')](shuye73)}}else{console[_0x3bfe('87','@!!J')]($[_0x3bfe('88','@!!J')]+_0x3bfe('89','m1Fr'))}}}else{$[_0x3bfe('8a','W%dW')](e,_0x5da2a2)}}catch(_0xb23a62){if(_0x5370cf[_0x3bfe('8b','wLIy')](_0x5370cf[_0x3bfe('8c','DywT')],_0x5370cf[_0x3bfe('8d','LEj7')])){console[_0x3bfe('8e','aptw')]($[_0x3bfe('8f','Xu%$')]+_0x3bfe('90','YTBE'))}else{$[_0x3bfe('91','c@]k')](_0xb23a62,_0x5da2a2)}}finally{if(_0x5370cf[_0x3bfe('92','AbZ(')](_0x5370cf[_0x3bfe('93','LEj7')],_0x5370cf[_0x3bfe('94','c@]k')])){_0x5370cf[_0x3bfe('95','i$e3')](_0x193c27)}else{_0x20c35a=JSON[_0x3bfe('96','g&Qz')](_0x20c35a)}}})}else{_0x108123[_0x3bfe('97','Qo]2')](_0x193c27)}})}function shuye73(){var _0x12780f={'bcBTL':function(_0x524ee3,_0x5afafb){return _0x524ee3!==_0x5afafb},'JUXGd':_0x3bfe('98','Jny$'),'tGnfa':_0x3bfe('99','sP2i'),'aJRFz':function(_0x3d79a9,_0xb1f80){return _0x3d79a9!==_0xb1f80},'VPvWL':_0x3bfe('9a','g&Qz'),'QPMMC':function(_0x361f96,_0x49a0a0){return _0x361f96<_0x49a0a0},'NeDyU':function(_0xe5fe4f,_0xb8ec91){return _0xe5fe4f===_0xb8ec91},'UjUEM':_0x3bfe('9b','D@%['),'tmQeH':_0x3bfe('9c','!$5i'),'GkYPW':function(_0x23cbda,_0x21ec4b){return _0x23cbda(_0x21ec4b)},'ugjdS':function(_0x1ff711,_0x1a3ab0){return _0x1ff711===_0x1a3ab0},'cpMSJ':_0x3bfe('9d','7HwZ'),'SkWCf':_0x3bfe('9e','c@]k'),'YqRkl':_0x3bfe('9f','KN6d'),'wpDXT':function(_0x302ff7){return _0x302ff7()},'yqVKW':function(_0x399b40){return _0x399b40()},'kmlli':_0x3bfe('a0','VhgQ'),'bQrqd':_0x3bfe('a1','m1Fr')};return new Promise(_0x187b8d=>{var _0x2bb2a0={'yiXgt':function(_0x199f1e){return _0x12780f[_0x3bfe('a2','Ytz2')](_0x199f1e)}};$[_0x3bfe('a3','UuGW')]({'url':_0x12780f[_0x3bfe('a4','v58%')],'headers':{'User-Agent':_0x12780f[_0x3bfe('a5','RZ7i')]}},async(_0x55f57c,_0x55892a,_0x1bf556)=>{if(_0x12780f[_0x3bfe('a6','VhgQ')](_0x12780f[_0x3bfe('a7','7HwZ')],_0x12780f[_0x3bfe('a8','NwUq')])){try{if(_0x55f57c){console[_0x3bfe('a9','YTBE')]($[_0x3bfe('aa','GFfn')]+_0x3bfe('ab','(2#('))}else{if(_0x12780f[_0x3bfe('ac','v58%')](_0x12780f[_0x3bfe('ad','hCv^')],_0x12780f[_0x3bfe('ae','5F[J')])){if(_0x55f57c){console[_0x3bfe('af','W%dW')]($[_0x3bfe('b0','Jny$')]+_0x3bfe('b1','5F[J'))}else{_0x1bf556=JSON[_0x3bfe('b2','GFfn')](_0x1bf556)}}else{$[_0x3bfe('b3','AbZ(')]=JSON[_0x3bfe('5b','sP2i')](_0x1bf556);if(_0x12780f[_0x3bfe('b4','BlOm')]($[_0x3bfe('b5','RZ7i')][_0x3bfe('b6','DywT')],0x0)){for(let _0x3899b6=0x0;_0x12780f[_0x3bfe('b7','(2#(')](_0x3899b6,$[_0x3bfe('b8','@!!J')][_0x3bfe('b9','k[Fu')][_0x3bfe('ba','9ya6')]);_0x3899b6++){if(_0x12780f[_0x3bfe('bb','DywT')](_0x12780f[_0x3bfe('bc','LEj7')],_0x12780f[_0x3bfe('bd','D@%[')])){console[_0x3bfe('74','$UE)')]($[_0x3bfe('be','wLIy')]+_0x3bfe('bf','UuGW'))}else{let _0x4ccafb=$[_0x3bfe('c0','W%dW')][_0x3bfe('c1','ICf^')][_0x3899b6];await $[_0x3bfe('c2',')^Sa')](0x1f4);await _0x12780f[_0x3bfe('c3','AbZ(')](wuzhi02,_0x4ccafb)}}}}}}catch(_0x1f4710){if(_0x12780f[_0x3bfe('c4','wfE[')](_0x12780f[_0x3bfe('c5','W%dW')],_0x12780f[_0x3bfe('c6','OKiH')])){_0x2bb2a0[_0x3bfe('c7','7HwZ')](_0x187b8d)}else{$[_0x3bfe('c8','sP2i')](_0x1f4710,_0x55892a)}}finally{if(_0x12780f[_0x3bfe('c9','hCv^')](_0x12780f[_0x3bfe('ca','OKiH')],_0x12780f[_0x3bfe('cb','D@%[')])){$[_0x3bfe('cc','5F[J')](e,_0x55892a)}else{_0x12780f[_0x3bfe('cd','sP2i')](_0x187b8d)}}}else{$[_0x3bfe('ce','i$e3')](e,_0x55892a)}})})};_0xod1='jsjiami.com.v6';

function taskPostUrl(function_id, body) {
  return {
    url: `https://api.m.jd.com/`,
    body: `appid=activities_platform&functionId=${function_id}&body=${escape(JSON.stringify(body))}&t=${+new Date()}`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      // 'user-agent': $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'user-agent': "jdltapp;iPhone;3.3.2;14.3;b488010ad24c40885d846e66931abaf532ed26a5;network/4g;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPhone11,8;addressid/2005183373;hasOCPay/0;appBuild/1049;supportBestPay/0;pv/220.46;apprpd/;ref/JDLTSubMainPageViewController;psq/0;ads/;psn/b488010ad24c40885d846e66931abaf532ed26a5|520;jdv/0|iosapp|t_335139774|liteshare|CopyURL|1618673222002|1618673227;adk/;app_device/IOS;pap/JA2020_3112531|3.3.2|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1 ",
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded",
      "referer": "https://an.jd.com/babelDiy/Zeus/q1eB6WUB8oC4eH1BsCLWvQakVsX/index.html"
    }
  }
}


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
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
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