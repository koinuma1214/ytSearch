/*
 * 利用関数の宣言
 */
// 各種変数
var express = require('express');
var router = express.Router();
var condition = {
  maxResults:50,
  order : 'relevance'
}

var searchCondition = {
  part:['id', 'snippet']
}
var result = null
var titleText = 'Channel Search'

// youtube系の変数
const {google} = require("googleapis");
const youtube = google.youtube({
    version: "v3",
    auth: 'AIzaSyDQ84RTme-2MNnqHa4hXsWiSXuS5Oo9zj0',
});

/* GET home page. */
router.get('/', function(req, res, next) {
  /*
   * レンダリング処理
   */
  res.render('channelSearch',
    { 
      title: titleText,
      condition: condition,
      result : null
     });
});

router.post('/', function(req, res, next) {
  // 入力された検索条件の取得
  let inputData = req.body
  if (inputData.qtext != '') {
    searchCondition.q = [inputData.qtext];
  }

  searchCondition.order = inputData.order;

  if(inputData.startDate != '') {
    searchCondition.publishedAfter = new Date(inputData.startDate).toISOString();
  }

  if(inputData.endDate != '') {
    searchCondition.publishedBefore = new Date(inputData.endDate).toISOString();
  }

  // 検索処理
  (async () => {
    var seachResult = null;
    var searchEnd = false;
    var nextPageToken = '';
    var iMax = 100;
    var i = 0;
    do {
      // 関数の宣言
      var tempSeachResult = null;
      var tempMaxResults = 0;

      if(seachResult === null)  {
        // 初回検索処理
        if(inputData.maxResults >= 50) {
          tempMaxResults = 50;
        } else {
          tempMaxResults = inputData.maxResults;
        }
        searchCondition.maxResults = tempMaxResults;

        tempSeachResult = await youtube.search.list({
          ...searchCondition,
          type: 'channel'
        });

        seachResult = tempSeachResult;
        seachResult.part = ['id', 'snippet'];
      } else {
        // 2回目以降の検索
        tempMaxResults = inputData.maxResults - seachResult.data.items.length;
        if(tempMaxResults >= 50) {
          tempMaxResults = 50;
        }
        searchCondition.maxResults = tempMaxResults;

        tempSeachResult = await youtube.search.list({
          ...seachResult,
          pageToken: nextPageToken,
          type: 'channel'
        });
        seachResult.data.items = seachResult.data.items.concat(tempSeachResult.data.items);
      }

      // 検索後処理
      nextPageToken = tempSeachResult.data.nextPageToken;     
      if(tempSeachResult.data.pageInfo.totalResults === 0 || 
          tempSeachResult.data.nextPageToken === "" ||
          seachResult.data.items.length >= inputData.maxResults ||
          i > iMax) {
        searchEnd = true;
      }
      i++;
    } while(searchEnd === false)

    // 描画処理
    res.render('channelSearch',
      {
        title: titleText,
        condition: inputData,
        result: seachResult
    });
  })();
});

module.exports = router;