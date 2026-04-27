 const quizzes = {
      '1': { question:"蔵王ジャンプ台が建設されたのはいつでしょうか?", options:["1976年","1978年","1980年","1982年"], correct:1, keyword:"ツ", hint:"受付で配ったパンフレットを見よう!" },
      '2': { question:"ジャンプ台の下から上までの標高差と近い高さの建物はどれでしょうか?", options:["山形市役所","山形県庁","上山スカイタワー","霞城セントラル"], correct:3, keyword:"ャ", hint:"インフォメーションコーナー横の看板を見てみよう!" },
      '3': { question:"髙梨沙羅選手が蔵王ジャンプ台で出した最大の飛距離は？", options:["101.0m","103.5m","106.0m","108.5m"], correct:2, keyword:"ェ", hint:"ジャンプ台に設置されている看板を見てみよう!" },
      '4': { question:"ランディングバーンの最大斜度は何度？", options:["35度","36.5度","38度","39.5度"], correct:1, keyword:"シ", hint:"受付で配ったパンフレットを見よう!" },
      '5': { question:"8月のサマージャンプ大会で第2位の内藤智文選手の勤務先は？", options:["蔵王温泉宿泊施設","蔵王温泉スキー場","山形県職員","山形市職員"], correct:3, keyword:"ン", hint:"受付テントの新聞コピーを見てみよう!" }
    };
    const finalAnswer = "シャンツェ";

    function playSound(id){const s=document.getElementById(id); if(s){s.currentTime=0;s.play();}}

    function renderPage(){
      const container=document.getElementById("main-container");
      container.innerHTML='<div id="keyword-message"></div>';
      let qid=null;
      if(window.location.hash) qid=window.location.hash.replace("#q","");

      if(qid){
        const quiz=quizzes[qid];
        if(!quiz){container.innerHTML+="<p>クイズが見つかりません。</p>";}
        else{
          let html=`<div class="question">${quiz.question}</div>`;
          html+=`<div class="options">`;
          quiz.options.forEach((opt,i)=>{html+=`<button onclick="checkAnswer(${i},'${qid}')">${opt}</button>`;});
          html+=`</div>`;
          html+=`<button onclick="document.getElementById('hint').style.display='block'">💡 ヒントを見る</button>`;
          html+=`<div class="hint" id="hint">${quiz.hint}</div>`;
          container.innerHTML+=html;
        }
      } else {
        let keywords=[];
        Object.keys(quizzes).forEach(id=>{const k=localStorage.getItem(`quiz${id}_cleared`); if(k) keywords.push(k);});
        let html=`<h2>問題が5つのキーワードをはめ込んで答えを導きだそう！</h2>`;
        if(keywords.length>0){
          html+=`<div class="keyword">`+
            keywords.map(k=>k.split("").map(ch=>`<span class="char">${ch}</span>`).join("")).join("")+
            `</div>`;
        }else html+="<p>まだキーワードを集めていません。</p>";

        if(keywords.length===Object.keys(quizzes).length){
          html+=`<div class="hint" style="display:block; margin-top:15px; font-weight:bold;">💡 ヒント: 蔵王ジャンプ台の別名は「アリオンテック蔵王〇〇〇〇〇」</div>`;
          html+=`<div id="final-step"><input type="text" id="final-answer" placeholder="答えを入力"><br><button onclick="checkFinalAnswer()">送信</button><p id="final-result"></p><div id="survey-link"></div></div>`;
        } else html+=`<p style="color:red; font-weight:bold;">⚠️ まだ全てのキーワードを集めていません！</p>`;
        container.innerHTML+=html;
      }

      // ✅ クイズ画面か最終問題画面かでボトム表示制御
      if(qid){
        updateCollectedKeywordsBottom(true); // クイズ画面では表示
      } else {
        updateCollectedKeywordsBottom(false); // 最終問題ページでは非表示
      }
    }

    function checkAnswer(selected,id){
      const quiz=quizzes[id];
      const buttons=document.querySelectorAll(".options button");
      const msgBox=document.getElementById("keyword-message");

      if(selected===quiz.correct){
        msgBox.innerHTML=`⭕ 正解！キーワードは <span style="color:red;">『${quiz.keyword}』</span> です`;
        msgBox.className="success";
        msgBox.style.display="block";

        localStorage.setItem(`quiz${id}_cleared`,quiz.keyword);
        playSound("correct-sound");
        confetti();
        updateCollectedKeywordsBottom();
      } else {
        buttons.forEach(btn=>{btn.disabled=true; btn.style.opacity="0.5";});
        let count=5;
        msgBox.className="fail"; msgBox.style.display="block"; msgBox.innerHTML=`❌ 残念！ ${count}秒後に再挑戦できます`;
        playSound("wrong-sound");

        const interval=setInterval(()=>{
          count--;
          if(count>0) msgBox.innerHTML=`❌ 残念！ ${count}秒後に再挑戦できます`;
          else{
            clearInterval(interval);
            msgBox.style.display="none";
            buttons.forEach(btn=>{btn.disabled=false; btn.style.opacity="1";});
          }
        },1000);
      }
    }

    function checkFinalAnswer(){
      const ans=document.getElementById("final-answer").value.trim();
      const result=document.getElementById("final-result");
      const survey=document.getElementById("survey-link");
      if(ans===finalAnswer){
        result.innerHTML="🎉 クリアおめでとう！"; result.classList.add("success");
        playSound("goal-sound"); confetti();
        survey.innerHTML=`<p><a href="https://docs.google.com/forms/d/1Bz52srduTq6eIsQ5wVxwftwYNuYEWrmZQH8yAFBcVb4/edit" target="_blank">次へ</a></p>`;
      } else{
        result.innerHTML="❌ 答えが違うみたいだ…キーワードを見直してみよう！"; survey.innerHTML="";
        playSound("wrong-sound");
      }
    }

    function getCollectedKeywordsArray(){
      const arr=[]; Object.keys(quizzes).forEach(id=>{const k=localStorage.getItem(`quiz${id}_cleared`); if(k) arr.push(k);}); return arr;
    }

    function renderCollectedKeywordsHTML_forBottom(){
      const arr=getCollectedKeywordsArray(); if(arr.length===0) return '';
      return `<div class="label">今まで解いた問題のキーワード</div><div class="keyword">`+
        arr.map(k=>k.split('').map(ch=>`<span class="char">${ch}</span>`).join('')).join('')+
        `</div>`;
    }

    function updateCollectedKeywordsBottom(show=true){
      const el=document.getElementById('collected-keywords-bottom');
      if(!el) return;
      if(!show){el.style.display='none'; return;}
      const html=renderCollectedKeywordsHTML_forBottom();
      if(html){el.innerHTML=html; el.style.display='block';}
      else {el.innerHTML=''; el.style.display='none';}
    }

    window.addEventListener("load", renderPage);
    window.addEventListener("hashchange", renderPage);

