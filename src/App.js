<!--
  ★ 商品總覽頁 v2.0 三段整合版(Shopline 片段格式)
  基底=線上三段程式化萃取(44 張商品卡零手打);2026-07-06 整合手術:
  A:★三顆 DOCTYPE 殼剝除→單一片段;Tailwind CDN 2 份→1 份、lucide 2 份→1 份
  B:★Tailwind 補 important:'.tea-promo-scope' 圍堵(原版無前綴 utility 全域裸奔,
     主題同名類會中彈)+preflight:false+hoverOnlyWhenSupported;未用的
     tea-* 自訂色移除
  C:★inline onclick ×8 全數轉 data-action/data-tr-* + addEventListener
     (Shopline 剝除險);window.onclick 全域劫持移除;window.TeaRitual 收進 IIFE
  D:★選茶小貼士彈窗原為死碼(openModal 無任何觸發點)→重寫為自訂類彈窗
     (Tailwind 圍堵後 body 下無 utility 可用)+九大系列引言下觸發鈕+搬 body+
     Esc+遮罩點擊+焦點管理
  E:★seg1 裸類選擇器 21 族(product-card/tag/price-tag/buy-btn/dot-*/tea-tip…)
     全數 scope 進 .tea-promo-scope(主題撞名險);::-webkit-scrollbar 全域→scope;
     keyframes slowZoom→btpoSlowZoom、float→btpoFloat(通用名)
  F:reveal-on-scroll 補 .btpojs JS 保險閘門(JS 沒跑=整頁隱形的舊災難);
     IO 失敗後備直接顯示;prefers-reduced-motion 全域塊;觸控裝置 hover
     transform 歸零
  G:平面茶包五張圖 owner 段修正為正規格式(原為拼接錯誤,CDN 目前容錯但不可賴);
     翠峰 3860x→800x;商品圖 44 張補 lazy/decoding(hero+吉祥物除外)
  H:★內容對表 2026-07 新版沖泡卡——靜候 45-60→50-60 秒、紅茶泡法 100℃ 滾水
     →95°C 熱水、茶量拆球型 8-10g/條型 3-5g、紅茶比例拆球型 1:20/條型 1:40
  I:茶韻測驗結果補「前往選購」連結(華崗茶/紅玉/木柵鐵觀音,三連結 fetch 200);
     多卡茶區×6 補手機滑動提示(與茶包區同款橘標);hero 畸形 onerror 移除
  ※ 全 44 條購買連結 fetch 驗證 200;貼上=單一版位取代原三段
  ⚠️ 待老闆裁決:88K「幼葒霜氣/青鴻香氣」、新佳陽「青鴻般滑順」、清境「鴻甜香氣」
     用字疑為產生器筆誤(非標準茶語);新佳陽(梨山 2100m)歸在大禹嶺茶區;
     翠巒「茶色彩金黃澄亮」建議「茶湯色澤金黃澄亮」
-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+Display:wght@400;500;600;700&family=Noto+Serif+TC:wght@400;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    important: '.tea-promo-scope',
    corePlugins: { preflight: false, visibility: false },
    future: { hoverOnlyWhenSupported: true }
  }
</script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<style>
/* ========= 關鍵修正：CSS 作用域隔離 (Scope) ========= */

        /* 我們建立一個 .tea-promo-scope 容器，所有樣式只在裡面生效 */



        /* 1. 取代原本的 body 設定 */

        .tea-promo-scope {

            font-family: "Noto Sans TC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

            background-color: #f9f9f7;

            color: #4a4a4a;

            overflow-x: hidden;

            letter-spacing: 0.04em;

            margin: 0;

            line-height: 1.6;

            width: 100%;

            position: relative; /* 確保定位正確 */

        }



        /* 2. 這是原本導致 Logo 變形和 Footer 跑版的元兇 */

        /* 修正：加上 .tea-promo-scope 前綴，限制它只影響此區塊內的元素 */

        .tea-promo-scope *, 

        .tea-promo-scope ::before, 

        .tea-promo-scope ::after {

            box-sizing: border-box;

            border-width: 0;

            border-style: solid;

            border-color: #e5e7eb;

        }



        /* 3. 字體設定也限制範圍 */

        .tea-promo-scope h1, 

        .tea-promo-scope h2, 

        .tea-promo-scope h3, 

        .tea-promo-scope h4, 

        .tea-promo-scope h5, 

        .tea-promo-scope h6, 

        .tea-promo-scope .serif {

            font-family: "Noto Serif Display", "Noto Serif TC", serif;

            color: #1c1917;

        }



        .tea-promo-scope p, 

        .tea-promo-scope span, 

        .tea-promo-scope div, 

        .tea-promo-scope li, 

        .tea-promo-scope a, 

        .tea-promo-scope button { color: inherit; text-decoration: none; }

        

        .tea-promo-scope button { cursor: pointer; }

        

        /* 4. 圖片設定修正：這行原本會讓 Header Logo 寬度變成 100% 導致變形 */

        /* 修正：只針對區塊內的圖片設定 */

        .tea-promo-scope img { max-width: 100%; display: block; height: auto; }



        /* 捲軸美化 (這個通常不影響佈局，可以保留) */

        .tea-promo-scope ::-webkit-scrollbar { width: 8px; }

        .tea-promo-scope ::-webkit-scrollbar-track { background: #f1f1f1; }

        .tea-promo-scope ::-webkit-scrollbar-thumb {

            background: #cbd5e1;

            border-radius: 4px;

        }



        /* 淡入動畫 */

        .tea-promo-scope.btpojs .reveal-on-scroll {

            opacity: 0;

            transform: translateY(30px);

            transition: all 0.4s cubic-bezier(0.5, 0, 0, 1);

        }

        .tea-promo-scope.btpojs .reveal-on-scroll.is-visible {

            opacity: 1;

            transform: translateY(0);

        }



        /* 背景慢速縮放 */

        @keyframes btpoSlowZoom {

            0% { transform: scale(1); }

            100% { transform: scale(1.1); }

        }

        .tea-promo-scope .animate-bg {

            animation: btpoSlowZoom 20s infinite alternate;

        }



        /* 吉祥物浮動動畫 */

        @keyframes btpoFloat {

            0% { transform: translateY(0px); }

            50% { transform: translateY(-12px); }

            100% { transform: translateY(0px); }

        }

        .tea-promo-scope .mascot-float {

            animation: btpoFloat 5s ease-in-out infinite;

        }

        .tea-promo-scope .mascot-float-delay {

            animation: btpoFloat 5s ease-in-out infinite;

            animation-delay: 2.5s;

        }



        /* ========= 商品區塊樣式 ========= */

        /* 修正選擇器優先權，確保 Tailwind 不會干擾 */

        .tea-promo-scope #products {

            background-color: #f9f9f7;

            padding: 32px 12px 40px;

            font-family: "Noto Sans TC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

        }



        /* 電腦版設定 */

        .tea-promo-scope .product-card {

            background-color: #ffffff;

            border: 1px solid #e5e5e5;

            transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;

            font-family: "Noto Serif Display", "Noto Serif TC", serif;

            font-size: 17px;

            line-height: 1.9;

            letter-spacing: 0.03em;

            border-radius: 16px;

            width: 100%;

            margin-inline: auto;

        }

        

        .tea-promo-scope .product-card:hover {

            transform: translateY(-4px);

            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);

            border-color: #d6d3d1;

        }



        /* 標題 */

        .tea-promo-scope .product-card h3 {

            font-size: 2.8rem;

            font-weight: 700;

            line-height: 1.2;

            margin-bottom: 0.5rem;

        }



        /* 標籤 */

        .tea-promo-scope .tag {

            font-family: "Noto Sans TC", sans-serif;

            font-size: 15px;

            padding: 0.4rem 1.1rem;

            border-radius: 4px;

            font-weight: 500;

            letter-spacing: 0.05em;

            background-color: #f3f4f6;

            color: #4b5563;

        }



        /* 價格區 */

        .tea-promo-scope .price-tag {

            font-family: 'Playfair Display', serif;

            font-weight: 600;

            letter-spacing: 0.5px;

            color: #dc2626;

            font-size: 2.4rem;

        }

        .tea-promo-scope .unit-text {

            font-size: 1.5rem;

            color: #78716c;

            font-weight: 500;

        }



        /* 購買按鈕 */

        .tea-promo-scope .buy-btn {

            background-color: #292524;

            color: #ffffff !important;

            border: none;

            letter-spacing: 0.15em;

            cursor: pointer;

            text-decoration: none;

            display: inline-flex;

            justify-content: center;

            align-items: center;

            font-size: 1.5rem;

            padding: 0.8rem 2.2rem;

            border-radius: 999px;

            font-family: "Noto Sans TC", sans-serif;

            transition: all 0.3s ease;

            font-weight: 600;

        }

        .tea-promo-scope .buy-btn:hover {

            background-color: #57534e;

            transform: translateY(-1px);

            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        }



        /* 圓點樣式 */

        .tea-promo-scope .dot-filled { width: 10px; height: 10px; border-radius: 50%; background-color: #57534e; margin-bottom: 2px;}

        .tea-promo-scope .dot-filled-fire { width: 10px; height: 10px; border-radius: 50%; background-color: #b45309; margin-bottom: 2px;}

        .tea-promo-scope .dot-empty { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #a8a29e; background-color: transparent; margin-bottom: 2px;}



        .tea-promo-scope .meta-text {

            font-size: 1.4rem;

            color: #57534e;

            font-weight: 500;

        }

        

        /* 茶師小叮嚀 */

        .tea-promo-scope .tea-tip {

            position: relative;

            background: #fafaf9;

            border-left: 5px solid #a8a29e;

            padding: 1.2rem 1.4rem;

            margin-top: 1rem;

            margin-bottom: 2.5rem;

            border-radius: 0 12px 12px 0;

            font-family: "Noto Sans TC", sans-serif;

            font-size: 1.5rem !important;

            line-height: 1.6;

            color: #57534e;

        }

        .tea-promo-scope .tea-tip::before {

            content: "💡 茶師小叮嚀";

            display: block;

            font-weight: 700;

            color: #57534e;

            margin-bottom: 0.5rem;

            font-size: 1.4rem;

        }



        /* ========= 手機版 RWD 優化 ========= */

        @media (max-width: 768px) {

            .tea-promo-scope #products {

                padding: 12px 0 24px 0;

                overflow-x: hidden;

            }



            .tea-promo-scope #products h2 {

                padding-left: 24px;

                font-size: 1.75rem;

            }

            .tea-promo-scope #products .flex.items-center {

                padding-right: 24px;

                margin-bottom: 0.75rem !important;

            }



            .tea-promo-scope #products .grid {

                display: flex !important;

                overflow-x: auto;

                scroll-snap-type: x mandatory;

                gap: 12px;

                padding: 0 24px 20px 24px; 

                scroll-padding-left: 24px;

                -webkit-overflow-scrolling: touch;

                scrollbar-width: none;

            }

            

            .tea-promo-scope #products .grid::-webkit-scrollbar {

                display: none;

            }



            .tea-promo-scope .product-card {

                min-width: 85vw; 

                max-width: 85vw;

                scroll-snap-align: start;

                flex-shrink: 0;

                padding: 12px !important; 

                border-radius: 12px;

                display: flex;

                flex-direction: column;

                gap: 4px;

                margin-bottom: 0;

                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

            }



            .tea-promo-scope .product-card:not(.grid .product-card) {

                min-width: calc(100% - 48px);

                margin: 0 24px;

            }



            .tea-promo-scope .product-card .md\:w-4\/12 {

                padding: 0 !important;

                background: transparent !important;

                margin-bottom: 0;

            }

            /* 修正圖片高度 */

            .tea-promo-scope .product-card img {

                max-height: 110px;

                width: auto;

                margin: 0 auto;

            }



            .tea-promo-scope .product-card .md\:w-8\/12 {

                padding: 0 !important;

            }



            .tea-promo-scope .product-card h3 {

                font-size: 1.25rem !important;

                line-height: 1.2 !important;

                margin-bottom: 0;

            }

            .tea-promo-scope .product-card p.text-stone-400 {

                font-size: 0.75rem !important;

                margin-bottom: 0.25rem;

                letter-spacing: 0.02em;

            }

            

            .tea-promo-scope .origin-ferment {

                display: flex;

                flex-direction: row; 

                align-items: center;

                flex-wrap: wrap;

                column-gap: 8px;

                row-gap: 2px;

                margin-top: 2px;

                margin-bottom: 4px;

                width: 100%;

            }

            

            .tea-promo-scope .meta-text {

                font-size: 1rem !important;

                margin: 0 !important;

                line-height: 1.2;

                display: flex;

                align-items: center;

            }

            

            .tea-promo-scope .origin-text {

                color: #57534e;

                font-weight: 600;

                padding-right: 8px;

                border-right: 1px solid #d6d3d1;

                margin-right: 0;

            }

            

            .tea-promo-scope .origin-ferment .flex.items-center {

                margin: 0 !important;

                gap: 4px !important;

            }

            

            .tea-promo-scope .dot-filled, .dot-filled-fire, .dot-empty {

                width: 7px;

                height: 7px;

                margin-bottom: 0;

            }

            

            .tea-promo-scope .description-text {

                font-size: 1.1rem !important;

                line-height: 1.4;

                margin-bottom: 0.25rem;

                display: -webkit-box;

                -webkit-line-clamp: 2;

                -webkit-box-orient: vertical;

                overflow: hidden;

                color: #57534e;

            }



            .tea-promo-scope .flavor-tags {

                gap: 0.3rem;

                margin-bottom: 0.5rem !important;

                padding-bottom: 0;

            }

            .tea-promo-scope .flavor-tags .tag {

                padding: 0.15rem 0.5rem !important;

                font-size: 0.95rem !important;

            }

            

            .tea-promo-scope .tea-tip {

                font-size: 1.05rem !important;

                padding: 0.4rem 0.6rem;

                margin-top: 0;

                margin-bottom: 0.5rem;

                border-left-width: 2px;

                background-color: #f5f5f4;

                line-height: 1.3;

            }

            .tea-promo-scope .tea-tip::before {

                font-size: 1.1rem;

                margin-right: 0.2rem;

            }



            .tea-promo-scope .price-area {

                padding: 0.5rem !important;

                margin-top: auto; 

                background-color: #fafaf9 !important;

                border: none;

                border-radius: 8px;

            }



            .tea-promo-scope .product-card .price-row {

                display: flex;

                flex-direction: row;

                align-items: center;

                justify-content: space-between;

                gap: 8px;

            }



            .tea-promo-scope .product-card .price-row > div:first-child {

                width: auto;

                border-bottom: none;

                padding-bottom: 0;

                margin-bottom: 0;

                display: flex;

                flex-direction: row; 

                align-items: baseline;

                flex-wrap: wrap;

                gap: 4px;

            }

            

            .tea-promo-scope .product-card .price-row > div:first-child > div {

                display: flex;

                align-items: baseline;

            }

            

            .tea-promo-scope .text-stone-300 {

                display: inline-block !important;

                margin: 0 2px;

                font-size: 0.75rem;

                opacity: 0.4;

            }



            .tea-promo-scope .price-tag {

                font-size: 1.2rem; 

                color: #b91c1c; 

                line-height: 1;

            }

            .tea-promo-scope .unit-text {

                font-size: 0.7rem;

                margin-right: 0.2rem;

            }



            .tea-promo-scope .product-card .buy-btn {

                font-size: 0.85rem !important;

                padding: 0.35rem 1rem !important;

                height: 32px;

            }

        }

    

    /* ===== v2.0 整合層(彈窗/觸發鈕/測驗連結/動態偏好) ===== */
    .tea-promo-scope .btpo-tips-btn {
        display: inline-flex; align-items: center; gap: 8px;
        margin-top: 28px; padding: 12px 28px; border-radius: 999px;
        border: 1px solid #d6d3d1; background: #fff; color: #57534e;
        font-family: "Noto Sans TC", sans-serif; font-size: 16px;
        letter-spacing: 0.08em; cursor: pointer;
        transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .btpo-modal-overlay {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        padding: 24px; background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        opacity: 0; visibility: hidden;
        transition: opacity 0.3s ease, visibility 0s linear 0.3s;
        font-family: "Noto Sans TC", sans-serif;
    }
    .btpo-modal-overlay.active { opacity: 1; visibility: visible; transition: opacity 0.3s ease, visibility 0s; }
    .btpo-modal {
        background: #fff; width: 100%; max-width: 560px;
        border-radius: 24px; border-top: 8px solid #d97706;
        padding: 40px 32px; position: relative; text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2); box-sizing: border-box;
        transform: translateY(16px); transition: transform 0.3s ease;
    }
    .btpo-modal * { box-sizing: border-box; }
    .btpo-modal-overlay.active .btpo-modal { transform: translateY(0); }
    .btpo-modal-close {
        position: absolute; top: 16px; right: 20px; border: 0; background: none;
        font-size: 22px; color: #a8a29e; cursor: pointer; padding: 6px; line-height: 1;
    }
    .btpo-modal-icon {
        width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%;
        background: #fef3c7; display: flex; align-items: center; justify-content: center;
        font-size: 34px;
    }
    .btpo-modal h3 {
        font-family: "Noto Serif Display", "Noto Serif TC", serif;
        font-size: 26px; color: #292524; margin: 0 0 20px; font-weight: 700;
    }
    .btpo-modal-body {
        text-align: left; background: #fafaf9; border-radius: 16px;
        padding: 22px 24px; margin: 0 0 24px; color: #57534e;
        font-size: 16px; line-height: 1.8;
    }
    .btpo-modal-btn {
        display: block; width: 100%; border: 0; cursor: pointer;
        background: #292524; color: #fff; padding: 15px; border-radius: 14px;
        font-size: 16px; font-weight: 700; letter-spacing: 0.08em;
        transition: background 0.3s ease;
    }
    #tea-ritual-wrapper .tr-result-link {
        display: inline-block; margin-top: 26px; padding: 14px 36px;
        border-radius: 999px; background: #1c1917; color: #fff !important;
        font-size: 1.7rem; letter-spacing: 0.1em; text-decoration: none;
        transition: background 0.3s ease;
    }
    @media (max-width: 768px) {
        #tea-ritual-wrapper .tr-result-link { font-size: 1.1rem; padding: 10px 26px; margin-top: 16px; }
        .tea-promo-scope .btpo-tips-btn { font-size: 14px; padding: 10px 20px; margin-top: 20px; }
    }
    @media (hover: hover) {
        .tea-promo-scope .btpo-tips-btn:hover { border-color: #d97706; color: #b45309; background: #fffbeb; }
        .btpo-modal-btn:hover { background: #57534e; }
        .btpo-modal-close:hover { color: #292524; }
        #tea-ritual-wrapper .tr-result-link:hover { background: #44403c; }
    }
    /* 觸控裝置:自訂 hover 的位移殘留歸零 */
    @media (hover: none) {
        .tea-promo-scope .product-card:hover,
        .tea-promo-scope #daily-tastea-original-leaf .product-card:hover,
        .tea-promo-scope #classic-flat-tea-bags .product-card:hover,
        .tea-promo-scope .buy-btn:hover,
        .tea-promo-scope .pc-btn:hover,
        #tea-ritual-wrapper .tr-step-item:hover,
        #tea-ritual-wrapper .tr-param-card:hover { transform: none !important; }
    }
    /* 尊重減少動態偏好 */
    @media (prefers-reduced-motion: reduce) {
        .tea-promo-scope *, .tea-promo-scope *::before, .tea-promo-scope *::after,
        #tea-ritual-wrapper *, .btpo-modal-overlay, .btpo-modal {
            animation: none !important; transition: none !important;
        }
        .tea-promo-scope.btpojs .reveal-on-scroll { opacity: 1; transform: none; }
    }
</style>
<style>
/* ========= CSS 作用域隔離 (Scope) ========= */

    /* 建立 .tea-promo-scope 容器，所有樣式只在裡面生效 */



    /* 1. 基礎設定：取代原本的 body 設定 */

    .tea-promo-scope {

      margin: 0;

      padding: 0;

      font-family: "Noto Sans TC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

      background-color: #f9f9f7;

      color: #44403c; /* 預設文字顏色 */

      width: 100%;

      position: relative;

      line-height: 1.5; /* 確保行高 */

    }



    /* 2. 樣式重置 (Reset)：只針對此區塊內的元素 */

    /* 這是避免影響全站排版的關鍵 */

    .tea-promo-scope *, 

    .tea-promo-scope ::before, 

    .tea-promo-scope ::after {

      box-sizing: border-box;

      border-width: 0;

      border-style: solid;

      border-color: #e5e7eb;

    }



    /* 確保圖片不破版 */

    .tea-promo-scope img {

      max-width: 100%;

      display: block;

      height: auto;

    }



    /* ========= 區塊共用設定 (加上前綴) ========= */

    .tea-promo-scope #daily-tastea-original-leaf,

    .tea-promo-scope #classic-flat-tea-bags {

      background-color: #f9f9f7;

      padding: 30px 16px 60px;

      color: #44403c;

      letter-spacing: 0.04em;

      line-height: 1.8;

    }



    .tea-promo-scope #daily-tastea-original-leaf .dt-container,

    .tea-promo-scope #classic-flat-tea-bags .dt-container {

      max-width: 1280px;

      margin: 0 auto;

    }



    /* 滑動提示按鈕動畫 */

    .tea-promo-scope .swipe-arrow {

      display: inline-block;

      animation: hintSlide 1.5s infinite ease-in-out;

    }



    @keyframes hintSlide {

      0%, 100% { transform: translateX(0); opacity: 0.6; }

      50%      { transform: translateX(3px); opacity: 1; }

    }



    /* ---- 商品列表：桌機直向、手機橫滑 ---- */

    .tea-promo-scope #daily-tastea-original-leaf .dt-list,

    .tea-promo-scope #classic-flat-tea-bags .dt-list {

      display: flex;

      flex-direction: column;

      gap: 32px;

    }



    /* ---- 單張商品卡共用 ---- */

    .tea-promo-scope #daily-tastea-original-leaf .product-card,

    .tea-promo-scope #classic-flat-tea-bags .product-card {

      display: flex;

      flex-wrap: wrap;

      background-color: #ffffff;

      border-radius: 16px;

      border: 1px solid #e7e5e4;

      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);

      overflow: hidden;

      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

      font-family: "Noto Serif TC","Noto Serif Display",serif;

    }



    .tea-promo-scope #daily-tastea-original-leaf .product-card:hover,

    .tea-promo-scope #classic-flat-tea-bags .product-card:hover {

      transform: translateY(-3px);

      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);

      border-color: #d6d3d1;

    }



    /* 圖片區 */

    .tea-promo-scope #daily-tastea-original-leaf .pc-image-wrap,

    .tea-promo-scope #classic-flat-tea-bags .pc-image-wrap {

      width: 100%;

      max-width: 320px;

      display: flex;

      align-items: center;

      justify-content: center;

      padding: 24px;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-image,

    .tea-promo-scope #classic-flat-tea-bags .pc-image {

      max-height: 280px;

      width: auto;

      display: block;

      object-fit: contain;

      filter: drop-shadow(0 12px 20px rgba(15, 23, 42, 0.18));

    }



    /* ---- 原葉茶包背景漸層 ---- */

    .tea-promo-scope #daily-tastea-original-leaf .bg-chun-cui { background: linear-gradient(135deg,#e3f5d6 0%,#f9fbe7 40%,#fafaf9 100%); }

    .tea-promo-scope #daily-tastea-original-leaf .bg-milky-jinxuan { background: linear-gradient(135deg,#ffe8cc 0%,#fff3d6 40%,#fff7e6 100%); }

    .tea-promo-scope #daily-tastea-original-leaf .bg-ruby-black { background: linear-gradient(135deg,#ffe4e6 0%,#ffdce5 35%,#fff1f5 100%); }

    .tea-promo-scope #daily-tastea-original-leaf .bg-mellow-tgy { background: linear-gradient(135deg,#f3e5ab 0%,#fde7c5 40%,#fdf2e9 100%); }

    .tea-promo-scope #daily-tastea-original-leaf .bg-comprehensive { background: linear-gradient(135deg,#e9d5ff 0%,#ede9fe 40%,#f5f3ff 100%); }

    .tea-promo-scope #daily-tastea-original-leaf .bg-gift-box { background: linear-gradient(135deg,#ffd1dc 0%,#ffe4e6 35%,#fff0f3 100%); }

    .tea-promo-scope #daily-tastea-original-leaf .bg-wholeleaf-bulk { background: linear-gradient(135deg,#d1fae5 0%,#bbf7d0 30%,#ecfdf5 100%); }



    /* ---- 平面茶包背景漸層 ---- */

    .tea-promo-scope #classic-flat-tea-bags .bg-flat-dayuling { background: linear-gradient(135deg,#c4f1c2 0%,#dcfce7 40%,#ecfdf5 100%); }

    .tea-promo-scope #classic-flat-tea-bags .bg-flat-fushou { background: linear-gradient(135deg,#bfdbfe 0%,#dbeafe 40%,#eff6ff 100%); }

    .tea-promo-scope #classic-flat-tea-bags .bg-flat-roasted { background: linear-gradient(135deg,#fed7aa 0%,#ffedd5 40%,#fff7ed 100%); }

    .tea-promo-scope #classic-flat-tea-bags .bg-flat-huagang { background: linear-gradient(135deg,#fecaca 0%,#fed7e2 35%,#fef9c3 100%); }

    .tea-promo-scope #classic-flat-tea-bags .bg-flat-bulk { background: linear-gradient(135deg,#f5e6cc 0%,#fef3c7 40%,#fefce8 100%); }



    /* 文字內容區 */

    .tea-promo-scope #daily-tastea-original-leaf .pc-body,

    .tea-promo-scope #classic-flat-tea-bags .pc-body {

      flex: 1;

      min-width: 0;

      padding: 28px 28px 24px;

      display: flex;

      flex-direction: column;

      justify-content: center;

      gap: 10px;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-header-row,

    .tea-promo-scope #classic-flat-tea-bags .pc-header-row {

      display: flex;

      flex-wrap: wrap;

      justify-content: space-between;

      gap: 12px 24px;

      align-items: flex-start;

      margin-bottom: 4px;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-name,

    .tea-promo-scope #classic-flat-tea-bags .pc-name {

      font-size: 26px;

      font-weight: 700;

      letter-spacing: 0.08em;

      color: #1f2933;

      margin: 0;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-en-name,

    .tea-promo-scope #classic-flat-tea-bags .pc-en-name {

      margin: 4px 0 0;

      font-size: 14px;

      color: #a8a29e;

      letter-spacing: 0.16em;

      font-weight: 300;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-origin,

    .tea-promo-scope #classic-flat-tea-bags .pc-origin {

      font-size: 15px;

      font-weight: 500;

      color: #57534e;

      letter-spacing: 0.08em;

      white-space: nowrap;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-desc,

    .tea-promo-scope #classic-flat-tea-bags .pc-desc {

      margin-top: 10px;

      font-size: 15px;

      font-weight: 300;

      color: #57534e;

    }



    /* 標籤 */

    .tea-promo-scope #daily-tastea-original-leaf .pc-tags,

    .tea-promo-scope #classic-flat-tea-bags .pc-tags {

      margin-top: 10px;

      display: flex;

      flex-wrap: wrap;

      gap: 8px;

    }



    .tea-promo-scope #daily-tastea-original-leaf .tag,

    .tea-promo-scope #classic-flat-tea-bags .tag {

      font-family: "Noto Sans TC",sans-serif;

      font-size: 13px;

      padding: 4px 12px;

      border-radius: 999px;

      background-color: #f5f5f4;

      color: #57534e;

      border: 1px solid #e7e5e4;

      letter-spacing: 0.08em;

      font-weight: 400;

      white-space: nowrap;

    }



    /* 標籤顏色定義 */

    .tea-promo-scope .tag-green { background-color: #ecfccb !important; color: #365314 !important; border-color: #d9f99d !important; }

    .tea-promo-scope .tag-blue { background-color: #e0f2fe !important; color: #0c4a6e !important; border-color: #bae6fd !important; }

    .tea-promo-scope .tag-red { background-color: #ffe4e6 !important; color: #881337 !important; border-color: #fecdd3 !important; }

    .tea-promo-scope .tag-yellow { background-color: #fef9c3 !important; color: #713f12 !important; border-color: #fde047 !important; }

    .tea-promo-scope .tag-orange { background-color: #ffedd5 !important; color: #7c2d12 !important; border-color: #fed7aa !important; }

    .tea-promo-scope .tag-purple { background-color: #f3e8ff !important; color: #581c87 !important; border-color: #e9d5ff !important; }

    .tea-promo-scope .tag-teal { background-color: #ccfbf1 !important; color: #134e4a !important; border-color: #99f6e4 !important; }

    .tea-promo-scope .tag-brown { background-color: #f5f5f4 !important; color: #44403c !important; border-color: #e7e5e4 !important; }



    /* 價格區 + 購買按鈕 */

    .tea-promo-scope #daily-tastea-original-leaf .pc-footer,

    .tea-promo-scope #classic-flat-tea-bags .pc-footer {

      margin-top: 16px;

      padding: 16px 18px;

      border-radius: 12px;

      background-color: #fafaf9;

      border: 1px solid #e7e5e4;

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 16px;

      flex-wrap: wrap;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-price-row,

    .tea-promo-scope #classic-flat-tea-bags .pc-price-row {

      display: flex;

      flex-wrap: wrap;

      align-items: baseline;

      gap: 8px 20px;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-price-main,

    .tea-promo-scope #classic-flat-tea-bags .pc-price-main {

      display: flex;

      align-items: baseline;

      gap: 6px;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-price,

    .tea-promo-scope #classic-flat-tea-bags .pc-price {

      font-family: "Playfair Display","Noto Serif TC",serif;

      font-size: 24px;

      font-weight: 600;

      color: #dc2626;

      letter-spacing: 0.08em;

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-unit,

    .tea-promo-scope #classic-flat-tea-bags .pc-unit {

      font-size: 15px;

      color: #78716c;

      font-weight: 500;

    }



    /* 價格多行時用 */

    .tea-promo-scope #classic-flat-tea-bags .pc-price-block {

      display: flex;

      flex-direction: column;

      gap: 4px;

    }



    /* 購買按鈕：文字+圖示+漸層金 (桌機版) */

    .tea-promo-scope #daily-tastea-original-leaf .pc-btn,

    .tea-promo-scope #classic-flat-tea-bags .pc-btn {

      display: inline-flex;

      align-items: center;

      justify-content: center;

      padding: 8px 24px;       /* 內距 */

      border-radius: 999px;    /* 膠囊形狀 */

      border: none;

      /* 高級感漸層金 */

      background: linear-gradient(135deg, #d4af37 0%, #b4932a 100%);

      color: #ffffff;

      font-size: 15px;

      text-decoration: none;

      cursor: pointer;

      transition: all 0.3s ease;

      flex-shrink: 0;

      box-shadow: 0 4px 10px rgba(180, 147, 42, 0.3); /* 金色陰影 */

      font-weight: 600;

      gap: 6px; /* 文字與圖示間距 */

    }



    .tea-promo-scope #daily-tastea-original-leaf .pc-btn:hover,

    .tea-promo-scope #classic-flat-tea-bags .pc-btn:hover {

      transform: translateY(-2px) scale(1.05);

      box-shadow: 0 8px 16px rgba(180, 147, 42, 0.4);

    }

    

    /* 確保 icon 顏色與大小 */

    .tea-promo-scope .pc-btn i, 

    .tea-promo-scope .pc-btn svg {

      stroke-width: 2.5px;

    }



    /* ========= 手機版 RWD：橫向滑動 ========= */

    @media (max-width: 768px) {



      .tea-promo-scope #daily-tastea-original-leaf,

      .tea-promo-scope #classic-flat-tea-bags {

        padding: 4px 0 28px 0; /* padding-top 縮減至 4px */

      }



      /* 標題列：統一控制 padding 以確保與卡片對齊 */

      .tea-promo-scope #daily-tastea-original-leaf .dt-header,

      .tea-promo-scope #classic-flat-tea-bags .dt-header {

        padding-left: 24px;   /* 設定為 24px */

        padding-right: 24px;  /* 設定為 24px */

        margin-bottom: 0;

        flex-direction: column;

        align-items: flex-start;

        gap: 0;

      }



      .tea-promo-scope #daily-tastea-original-leaf .dt-title-block,

      .tea-promo-scope #classic-flat-tea-bags .dt-title-block {

         gap: 0;

      }



      .tea-promo-scope #daily-tastea-original-leaf .dt-title,

      .tea-promo-scope #classic-flat-tea-bags .dt-title {

        font-size: 1.75rem;

        margin-bottom: 0;

      }



      .tea-promo-scope #daily-tastea-original-leaf .dt-subtitle,

      .tea-promo-scope #classic-flat-tea-bags .dt-subtitle {

        font-size: 0.7rem;

      }



      /* 手機才顯示滑動提示 */

      .tea-promo-scope .swipe-hint {

        display: inline-flex;

      }



      .tea-promo-scope #daily-tastea-original-leaf .dt-header-line,

      .tea-promo-scope #classic-flat-tea-bags .dt-header-line {

        display: none;

      }



      /* 商品列表改成橫向滑動：padding 與標題一致 */

      .tea-promo-scope #daily-tastea-original-leaf .dt-list,

      .tea-promo-scope #classic-flat-tea-bags .dt-list {

        flex-direction: row;

        overflow-x: auto;

        scroll-snap-type: x mandatory;

        gap: 8px !important;

        padding: 0 24px 20px 24px !important; /* 左側 24px 以對齊標題 */

        scroll-padding-left: 24px !important; /* 確保 snap 對齊點也是 24px */

        -webkit-overflow-scrolling: touch;

      }



      /* 隱藏滾輪 (現代感) */

      .tea-promo-scope #daily-tastea-original-leaf .dt-list::-webkit-scrollbar,

      .tea-promo-scope #classic-flat-tea-bags .dt-list::-webkit-scrollbar {

        display: none;

      }



      /* 手機卡片 */

      .tea-promo-scope #daily-tastea-original-leaf .product-card,

      .tea-promo-scope #classic-flat-tea-bags .product-card {

        margin: 0 !important;

        min-width: 85vw;

        max-width: 85vw;

        scroll-snap-align: start;

        flex-shrink: 0;

        flex-direction: column;

        padding: 12px;

        border-radius: 12px;

        gap: 4px;

        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      }



      .tea-promo-scope #daily-tastea-original-leaf .pc-image-wrap,

      .tea-promo-scope #classic-flat-tea-bags .pc-image-wrap {

        max-width: 100%;

        padding: 10px;

        border-radius: 8px;

      }



      .tea-promo-scope #daily-tastea-original-leaf .pc-image,

      .tea-promo-scope #classic-flat-tea-bags .pc-image {

        max-height: 110px;

      }



      .tea-promo-scope #daily-tastea-original-leaf .pc-body,

      .tea-promo-scope #classic-flat-tea-bags .pc-body {

        padding: 0;

        gap: 4px;

        margin-top: 8px;

      }



      .tea-promo-scope #daily-tastea-original-leaf .pc-header-row,

      .tea-promo-scope #classic-flat-tea-bags .pc-header-row {

        flex-direction: column;

        gap: 2px;

        margin-bottom: 2px;

      }



      /* --- 字體放大區 (約+30%) --- */

      .tea-promo-scope #daily-tastea-original-leaf .pc-name,

      .tea-promo-scope #classic-flat-tea-bags .pc-name {

        font-size: 1.625rem; /* 原 1.25 -> 放大 */

        line-height: 1.2;

      }

      .tea-promo-scope #daily-tastea-original-leaf .pc-en-name,

      .tea-promo-scope #classic-flat-tea-bags .pc-en-name,

      .tea-promo-scope #daily-tastea-original-leaf .pc-origin,

      .tea-promo-scope #classic-flat-tea-bags .pc-origin {

        font-size: 1rem; /* 原 0.75 -> 放大 */

      }



      .tea-promo-scope #daily-tastea-original-leaf .pc-desc,

      .tea-promo-scope #classic-flat-tea-bags .pc-desc {

        font-size: 1.15rem; /* 原 0.9 -> 放大 */

        line-height: 1.4;

        margin-top: 4px;

        display: -webkit-box;

        -webkit-line-clamp: 2;

        -webkit-box-orient: vertical;

        overflow: hidden;

      }



      .tea-promo-scope #daily-tastea-original-leaf .pc-tags,

      .tea-promo-scope #classic-flat-tea-bags .pc-tags {

        flex-wrap: nowrap;

        overflow-x: auto;

        gap: 6px;

        margin-top: 8px;

        padding-bottom: 2px;

        -ms-overflow-style: none;

        scrollbar-width: none;

      }

      .tea-promo-scope #daily-tastea-original-leaf .pc-tags::-webkit-scrollbar,

      .tea-promo-scope #classic-flat-tea-bags .pc-tags::-webkit-scrollbar {

        display: none;

      }

      .tea-promo-scope #daily-tastea-original-leaf .tag,

      .tea-promo-scope #classic-flat-tea-bags .tag {

        font-size: 1.05rem; /* 原 0.8 -> 放大 */

        padding: 2px 8px;

        flex-shrink: 0;

      }



      /* 價格區 + 按鈕：手機版改回水平排列 */

      .tea-promo-scope #daily-tastea-original-leaf .pc-footer,

      .tea-promo-scope #classic-flat-tea-bags .pc-footer {

        flex-direction: row;  /* 改回水平排列 */

        align-items: center;

        justify-content: space-between;

        margin-top: 12px;

        padding: 12px;

        gap: 8px;

        background-color: #fafaf9;

      }

      

      .tea-promo-scope #daily-tastea-original-leaf .pc-price-row,

      .tea-promo-scope #classic-flat-tea-bags .pc-price-row {

        gap: 8px;

        width: auto;

      }



      .tea-promo-scope #daily-tastea-original-leaf .pc-price,

      .tea-promo-scope #classic-flat-tea-bags .pc-price {

        font-size: 1.56rem; /* 原 1.2 -> 放大 */

        color: #b91c1c;

      }

      

      .tea-promo-scope #daily-tastea-original-leaf .pc-unit,

      .tea-promo-scope #classic-flat-tea-bags .pc-unit {

        font-size: 0.95rem; /* 原 0.7 -> 放大 */

        color: #78716c;

      }



      /* 手機版按鈕：維持跟電腦版一樣的膠囊形狀，但稍微調整大小 */

      .tea-promo-scope #daily-tastea-original-leaf .pc-btn,

      .tea-promo-scope #classic-flat-tea-bags .pc-btn {

        width: auto;          /* 自動寬度 */

        height: 42px;         /* 固定高度 */

        padding: 0 20px;      /* 左右內距 */

        border-radius: 999px; /* 膠囊形狀 */

        font-size: 1rem;

        flex-shrink: 0;       /* 不被壓縮 */

      }

    }

  
</style>
<div class="tea-promo-scope antialiased text-lg" id="btpo-page">




<!-- Hero Section -->

<header class="relative w-full h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center bg-stone-900">

    <div class="absolute inset-0 z-0">

        <img decoding="async" src="https://img.shoplineapp.com/media/image_clips/69db691c01d5a54dc0845724/original.jpg?1775986971=&owner_id=5d202d62ec3a6d00018445e0"

             class="w-full h-full object-cover animate-bg opacity-70"

             alt="BESTEA Premium Taiwan Tea" />

        <div class="absolute inset-0 bg-black/30"></div>

    </div>

    <div class="absolute inset-x-0 bottom-0 z-10 pointer-events-none flex justify-between items-end px-4 md:px-20 pb-4 md:pb-8 w-full max-w-[1600px] mx-auto">

        <img decoding="async" src="https://img.shoplineapp.com/media/image_clips/693691d322bbc2000aa8e2d0/original.png?1765183952=&owner_id=5d202d62ec3a6d00018445e0" 

             alt="暮暮" class="w-24 md:w-48 lg:w-56 h-auto object-contain mascot-float opacity-90">

        <img decoding="async" src="https://img.shoplineapp.com/media/image_clips/693691d3aa340100162712f5/original.png?1765183952=&owner_id=5d202d62ec3a6d00018445e0" 

             alt="茶茶" class="w-24 md:w-48 lg:w-56 h-auto object-contain mascot-float-delay opacity-90">

    </div>

    <div class="relative z-20 text-center px-8 max-w-6xl mx-auto">

        <p class="serif text-sm md:text-medium tracking-[0.2em] md:tracking-[0.32em] mb-4 md:mb-6 uppercase font-light" style="color: #ffffff !important;">

            STRICTLY SELECTED TAIWAN TEA

        </p>

        <h1 class="serif text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-[0.10em] leading-[1.5] drop-shadow-lg" style="color: #ffffff !important;">

            從平地到雲端

        </h1>

        <p class="serif text-lg sm:text-3xl md:text-3xl leading-relaxed md:leading-[2] tracking-[0.06em] mb-8 md:mb-10 mt-4 md:mt-0" style="color: #ffffff !important;">

            一杯茶，承載山嶺風土，也承接品牌想說的話。<br class="hidden sm:block">

            從日常款到頂級高冷，我們為企業、餐飲與禮贈，嚴選最合適的一味。

        </p>

        <button data-action="scroll-products" type="button"

            class="mt-1 px-8 md:px-14 py-3 md:py-4 rounded-full text-xs md:text-base serif font-medium tracking-[0.2em] md:tracking-[0.3em]

                   transition-all duration-300 shadow-lg border border-white/50 hover:bg-white/30 bg-white/10 backdrop-blur-sm" style="color: #ffffff !important;">

            瀏覽全系列茶品

        </button>

    </div>

</header>



<section class="pt-12 pb-16 px-6 md:px-12 !bg-white">

    <div class="max-w-6xl mx-auto text-center reveal-on-scroll">

        <h2 class="serif text-3xl md:text-6xl font-semibold text-stone-900 mb-8 md:mb-10 tracking-[0.12em] leading-[1.4]">

    <span class="relative inline-block">

        <span class="absolute inset-x-0 bottom-2 h-4 bg-amber-200/70 -z-10 -rotate-1 rounded-md"></span>

        嚴選九大系列

    </span>

</h2>

        <p class="serif text-xl md:text-3xl text-stone-700 max-w-5xl mx-auto font-light tracking-[0.08em] leading-[2] md:leading-[2.5]">

            從 <span class="relative inline-block px-1"><span class="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 -z-10 rounded-sm"></span>高山烏龍</span> 的清香冷韻，

            到 <span class="relative inline-block px-1"><span class="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 -z-10 rounded-sm"></span>全發酵紅茶</span> 的醇厚蜜意，

            再到 <span class="relative inline-block px-1"><span class="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 -z-10 rounded-sm"></span>精焙工藝</span> 的深沉底蘊。

            我們為您完整呈現台灣茶的風土光譜。

        </p>
        <button type="button" data-action="open-tips" class="btpo-tips-btn">🍃 不知道怎麼選？看選茶小貼士</button>

    </div>

</section>



<section id="products" class="bg-[#f9f9f7]">

  <div class="products-container max-w-[1280px] mx-auto px-0 md:px-8 py-8 md:py-20 space-y-12 md:space-y-16">

        <!-- 四季春茶區 -->

        <div class="relative reveal-on-scroll">

            <div class="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 px-4 md:px-2">

                <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">四季春茶區</h2>

                <div class="h-[1px] bg-stone-300 flex-grow"></div>

                <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Four Seasons Spring</span>

            </div>

            <!-- 四季春茶 (單張卡，不做橫滑) -->

            <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/69331a14f31addcb476518ab/800x.webp?source_format=jpg" alt="四季春茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                </div>

                <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                    <div class="flex flex-col md:flex-row justify-between items-start mb-2 gap-4">

                        <div>

                            <h3 class="text-stone-800 tracking-wide serif">四季春茶</h3>

                            <p class="text-stone-400 mt-1 font-light tracking-wider">Four Seasons Spring Tea</p>

                        </div>

                        <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                            <p class="meta-text tracking-wide origin-text">松柏嶺冬片 (500m)</p>

                            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                <span class="text-sm md:text-xl">發酵度</span>

                                <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                            </div>

                        </div>

                    </div>

                    <p class="text-stone-600 mb-6 font-light description-text">香氣迷人而清雅，茶湯清澈透亮、入口甘醇滑順，展現冬片在一年四季中最為優秀的自然風味。</p>

                    <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                        <span class="tag" style="background:#FFF8D8 ;color:#8C6A00; border:1px solid #FFE9A2;">茉莉花韻</span>

                        <span class="tag">甘醇滑順</span>

                        <span class="tag">清澈透亮</span>

                    </div>

                    <div class="tea-tip">這款是辦公室人氣王！冷泡熱泡都超香，那股茉莉花味是天然的喔～</div>

                    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$250</span></div>

                                <span class="text-stone-300 font-light">|</span>

                                <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$900</span></div>

                            </div>

                            <a href="https://www.besttea1.com/products/%E5%9B%9B%E5%AD%A3%E6%98%A5" class="buy-btn shadow-sm">購買</a>

                        </div>

                    </div>

                </div>

            </div>

        </div>



        <!-- 阿里山茶區 -->

        <div class="relative reveal-on-scroll">

            <div class="flex items-center gap-4 md:gap-6 mb-4 md:mb-12 px-4 md:px-2">

                <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">阿里山茶區</h2>

                <div class="h-[1px] bg-stone-300 flex-grow"></div>

                <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Alishan High Mountain</span>

            </div>
<div class="md:hidden -mt-2 mb-3 px-4"><span class="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm">滑動查看更多 <span class="swipe-arrow">→</span></span></div>

            <div class="grid grid-cols-1 gap-8 md:gap-12">

                <!-- 1. 阿里山瑞里茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/69331a0d7c11c300181007b1/800x.webp?source_format=jpg" alt="阿里山瑞里茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">阿里山瑞里茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Alishan Ruili Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">阿里山 (1250m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">回甘性佳、口感滑溜順暢，香氣高雅而清透，伴隨淡雅青花香在口中細緩綻放。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                          <span class="tag" style="background:#E8F3FD;color:#1E64A3; border:1px solid #C5E0F7;">高雅清透</span>

                            <span class="tag">淡雅青花香</span>

                            <span class="tag">口感滑溜</span>

                        </div>

                        <div class="tea-tip">高山茶的入門首選！想要清爽不苦澀，選這支準沒錯。</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$400</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$1400</span></div>

                                </div>

                                <a href="https://www.besttea1.com/products/%E9%98%BF%E9%87%8C%E5%B1%B1%E7%91%9E%E9%87%8C%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- 2. 阿里山茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319fa767164000adab78a/800x.webp?source_format=jpg" alt="阿里山茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">阿里山茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Alishan Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">阿里山 (1500m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">茶湯順潤柔雅，香氣高雅細緻。帶有淡淡青花香，入口滑溜順暢，回甘鮮明，風味純淨而耐人尋味。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                            <span class="tag" style="background:#E8F3FD;color:#1E64A3; border:1px solid #C5E0F7;">順潤柔雅</span>

                            <span class="tag">回甘鮮明</span>

                            <span class="tag">細緻純淨</span>

                        </div>

                        <div class="tea-tip">經典中的經典，口感順滑，喝完杯底會有淡淡的香氣。</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$600</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2200</span></div>

                                </div>

                                 <a href="https://www.besttea1.com/products/%E9%98%BF%E9%87%8C%E5%B1%B1%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- 3. 阿里山金萱茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933181b524470000eb6b08c/800x.webp?source_format=jpg" alt="阿里山金萱茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">阿里山金萱茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Alishan Jin Xuan</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">阿里山 (1500m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">奶香濃郁中揉合淡雅草本氣息，茶湯滑順甘甜。香氣層層綻放，綿延的奶韻伴隨回甘在口中悠然留存。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                            <span class="tag" style="background:#E8F3FD;color:#1E64A3; border:1px solid #C5E0F7;">奶香濃郁</span>

                            <span class="tag">草本氣息</span>

                            <span class="tag">甘甜滑順</span>

                        </div>

                        <div class="tea-tip">這款有天然的奶香，不是加料喔！女生朋友最愛這一味。</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$575</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2100</span></div>

                                </div>

                                <a href="https://www.besttea1.com/products/alishan-jinxuan" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>



        <!-- 杉林溪茶區 -->

        <div class="relative reveal-on-scroll">

            <div class="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 px-4 md:px-2">

                <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">杉林溪茶區</h2>

                <div class="h-[1px] bg-stone-300 flex-grow"></div>

                <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Shanlinxi Tea</span>

            </div>

            <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319c3a23b8a0012490e42/800x.webp?source_format=jpg" alt="杉林溪茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                </div>

                <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                        <div>

                            <h3 class="text-stone-800 tracking-wide serif">杉林溪茶</h3>

                            <p class="text-stone-400 mt-0 font-light tracking-wider">Shanlinxi Tea</p>

                        </div>

                        <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                            <p class="meta-text tracking-wide origin-text">杉林溪 (1800m)</p>

                            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                <span class="text-sm md:text-xl">發酵度</span>

                                <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                            </div>

                        </div>

                    </div>

                    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">喉韻柔雅細緻、滋味甘醇圓潤。水質清透柔軟，伴隨淡雅竹花香在口中緩緩綻放，餘韻清爽悠長。</p>

                    <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                        <span class="tag" style="background:#E6F7F1;color:#1B8A6B;border:1px solid #C2EDE0;">喉韻柔雅</span>

                        <span class="tag">竹花香氣</span>

                        <span class="tag">水質清透</span>

                    </div>

                    <div class="tea-tip">喜歡「清冷」口感的朋友看這邊，這款喝起來有一種竹林裡的清新感。</div>

                    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$625</span></div>

                                <span class="text-stone-300 font-light">|</span>

                                <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2300</span></div>

                            </div>

                           <a href="https://www.besttea1.com/products/%E6%9D%89%E6%9E%97%E6%BA%AA%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                        </div>

                    </div>

                </div>

            </div>

        </div>



        <!-- 梨山茶區 -->

        <div class="relative reveal-on-scroll">

            <div class="flex items-center gap-4 md:gap-6 mb-4 md:mb-12 px-4 md:px-2">

                <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">梨山茶區</h2>

                <div class="h-[1px] bg-stone-300 flex-grow"></div>

                <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Lishan Premium</span>

            </div>
<div class="md:hidden -mt-2 mb-3 px-4"><span class="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm">滑動查看更多 <span class="swipe-arrow">→</span></span></div>

            <div class="grid grid-cols-1 gap-8 md:gap-12">

                <!-- 1. 梨山東眼茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/69331a03bc5bcc0012305771/800x.webp?source_format=jpg" alt="梨山東眼茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">梨山東眼茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan DongYan Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">梨山 (1600m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以清雅竹花香轉為溫潤熟果香為特色。茶湯醇厚飽滿、入口甘甜綿長，層次豐富而回韻自然。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                            <span class="tag" style="background:#F0FAF6;color:#2F705C; border:1px solid #D8EFE6;">溫潤熟果香</span>

                            <span class="tag">層次豐富</span>

                            <span class="tag">醇厚飽滿</span>

                        </div>

                        <div class="tea-tip">帶有特殊的果香，發酵度稍微高一點點，喝起來很溫潤。</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$425</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$1500</span></div>

                                </div>

                                <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E6%9D%B1%E7%9C%BC%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- 2. 梨山清境茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319fffa7d5f00103cfadc/800x.webp?source_format=jpg" alt="梨山清境茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">梨山清境茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Qingjing Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">梨山 (1700m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">清香澄透的茶湯著稱，散發自然山嵐的高冷氣息。入口水甜飽滿，帶有柔和的青韻與鴻甜香氣，滋味清爽而細緻悠長。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                           <span class="tag" style="background:#F0FAF6;color:#2F705C; border:1px solid #D8EFE6;">高冷山嵐</span>

                            <span class="tag">青韻甜水</span>

                            <span class="tag">清爽細緻</span>

                        </div>

                        <div class="tea-tip">住在清境農場旁的茶樹，喝起來就是有一種高山的清甜味。</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$450</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$1600</span></div>

                                </div>

                                <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E6%B8%85%E5%A2%83%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- 3. 梨山翠巒茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319d47c11c30018100798/800x.webp?source_format=jpg" alt="梨山翠巒茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">梨山翠巒茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Cuiluan Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">梨山 (1900m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">茶色彩金黃澄亮，香氣由清新轉為厚實。入口可感受飽滿的青果膠質與自然熟果香交織，風味細膩而富有層次。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                            <span class="tag" style="background:#F0FAF6;color:#2F705C; border:1px solid #D8EFE6;">金黃澄亮</span>

                            <span class="tag">青果膠質</span>

                            <span class="tag">細膩層次</span>

                        </div>

                        <div class="tea-tip">這款茶湯金黃透亮，喝下去感覺膠質滿滿，嘴巴會黏黏的喔！</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$625</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2300</span></div>

                                </div>

                                <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E7%BF%A0%E5%B7%92%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- 4. 梨山翠峰茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319af8139fe0010fcc1f9/800x.webp?source_format=jpg" alt="梨山翠峰茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">梨山翠峰茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Cuifeng Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">梨山 (2000m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">深厚飽實的茶韻與甘醇豐潤的膠質為特色。入口青香厚實、山氣強烈回甘，茶質澎湃而飽滿，展現高海拔茶區獨有的鮮活力量。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                            <span class="tag" style="background:#F0FAF6;color:#2F705C; border:1px solid #D8EFE6;">山氣強烈</span>

                            <span class="tag">茶質澎湃</span>

                            <span class="tag">青香厚實</span>

                        </div>

                        <div class="tea-tip">山氣很強！喜歡重口味高山茶的老饕通常都選這支。</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$650</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2400</span></div>

                                </div>

                                <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E7%BF%A0%E5%B3%B0%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- 5. 梨山吊橋頭茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933190b5fe468000c17c147/800x.webp?source_format=jpg" alt="梨山吊橋頭茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">梨山吊橋頭茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Suspension Bridge Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">梨山 (2200m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">濃厚熟果香為引，融合高冷山頭獨有的厚實山韻。茶湯甘醇飽滿而富含果膠般的滑順甜潤，呈現層層遞進、圓融深長的高山滋味。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                            <span class="tag" style="background:#F0FAF6;color:#2F705C; border:1px solid #D8EFE6;">濃厚熟果香</span>

                            <span class="tag">滑順甜潤</span>

                            <span class="tag">圓融深長</span>

                        </div>

                        <div class="tea-tip">產量很少的珍稀茶區，喝起來有一種很深邃的甜味，回甘很久。</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$950</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$3400</span></div>

                                </div>

                                <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E5%90%8A%E6%A9%8B%E9%A0%AD%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- 6. 梨山華崗茶 -->

                <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

                    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">

                        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/69331965648be4001835caf6/800x.webp?source_format=jpg" alt="梨山華崗茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">

                    </div>

                    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

                        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">

                            <div>

                                <h3 class="text-stone-800 tracking-wide serif">梨山華崗茶</h3>

                                <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Huagang Tea</p>

                            </div>

                            <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">

                                <p class="meta-text tracking-wide origin-text">梨山 (2400m)</p>

                                <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">

                                    <span class="text-sm md:text-xl">發酵度</span>

                                    <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>

                                </div>

                            </div>

                        </div>

                        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">蜜綠香氣見長，滋味清純而滑潤，梨山高海拔茶區獨有的冷冽氣韻。茶湯甘醇順暢、果膠質豐盈，尾韻帶著淡雅梨果香，乾淨細緻、耐人回味。</p>

                        <div class="flex flex-wrap gap-3 my-3 flavor-tags">

                            <span class="tag" style="background:#F0FAF6;color:#2F705C; border:1px solid #D8EFE6;">蜜綠香氣</span>

                            <span class="tag">高冷氣韻</span>

                            <span class="tag">淡雅梨果</span>

                        </div>

                        <div class="tea-tip">梨山最高的產區之一，天氣冷讓茶葉長得慢，味道超級細緻！</div>

                        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">

                                <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">

                                    <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1200</span></div>

                                    <span class="text-stone-300 font-light">|</span>

                                    <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$4400</span></div>

                                </div>

                               <a href="https://www.besttea1.com/products/%E8%8F%AF%E5%B4%97%E8%8C%B6" class="buy-btn shadow-sm">購買</a>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>



        <!-- 大禹嶺茶區 -->
<div class="relative reveal-on-scroll">

  <div class="flex items-center gap-4 md:gap-6 mb-4 md:mb-12 px-4 md:px-2">
    <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">大禹嶺茶區</h2>
    <div class="h-[1px] bg-stone-300 flex-grow"></div>
    <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Dayuling Premium</span>
  </div>
<div class="md:hidden -mt-2 mb-3 px-4"><span class="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm">滑動查看更多 <span class="swipe-arrow">→</span></span></div>

  <div class="grid grid-cols-1 gap-8 md:gap-12">

    <!-- 1. 新佳陽茶 -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319adf10a720012a70fd7/800x.webp?source_format=jpg" alt="新佳陽茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>

      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">新佳陽茶</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">XinJiaYang Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">梨山 (2100m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1">
                <div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">
          散發清雅青花香，並交織一抹清新的梨花氣息。茶湯甘甜柔和、伴隨青鴻般的滑順質地，風味明淨而透亮，展現高山茶特有的純淨芳韻。
        </p>

        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#E9F7EC; color:#2E7D32; border:1px solid #C8E6C9;">清雅青花</span>
          <span class="tag">甘甜柔和</span>
          <span class="tag">明淨透亮</span>
        </div>

        <div class="tea-tip">大禹嶺的入門款，雖然是入門但已經比很多高山茶都強了！</div>

        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$750</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2800</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E6%96%B0%E4%BD%B3%E9%99%BD%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>

      </div>
    </div>

    <!-- 2. 大禹嶺88K茶 -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933196b77ee3c00140df50f/800x.webp?source_format=jpg" alt="大禹嶺88K茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>

      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">大禹嶺88K茶</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">88K Dayuling Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">大禹嶺 (2300m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1">
                <div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">
          以翠綠鮮活的葉底與柔和軟水滋味見長。茶湯細緻醇厚、帶著幼葒霜氣緩緩上揚，融入清新的青鴻香氣，展現高冷茶區特有的清朗與純淨。
        </p>

        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#E9F7EC; color:#2E7D32; border:1px solid #C8E6C9;">翠綠鮮活</span>
          <span class="tag">幼葒霜氣</span>
          <span class="tag">清朗純淨</span>
        </div>

        <div class="tea-tip">這就是傳說中的88K，喝起來有一種特別的「霜氣」，非常清爽。</div>

        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1100</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$4000</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E5%A4%A7%E7%A6%B9%E5%B6%BA88k%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>

      </div>
    </div>

    <!-- 3. 大禹嶺90K茶 -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933196eeeea2400124a634c/800x.webp?source_format=jpg" alt="大禹嶺90K茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>

      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">大禹嶺90K茶</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">90K Dayuling Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">大禹嶺 (2300m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1">
                <div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">
          以深沉濃郁的木質香為主調，茶湯金黃透亮。質地醇厚紮實，冷磺氣息強勁而細緻，伴隨高冷原始林的成熟果香在口中綻放。
        </p>

        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#E9F7EC; color:#2E7D32; border:1px solid #C8E6C9;">深沉木質</span>
          <span class="tag">冷磺氣息</span>
          <span class="tag">成熟果香</span>
        </div>

        <div class="tea-tip">比88K更深山！那種原始森林的氣息，喝過就回不去了。</div>

        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1100</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$4000</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E5%A4%A7%E7%A6%B9%E5%B6%BA90k%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>

      </div>
    </div>

    <!-- 4. 大禹嶺山皇【精製茶】（✅已修正：不多關/少關 div） -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">

      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319165358b000168a0ec9/800x.webp?source_format=jpg" alt="大禹嶺山皇" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>

      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">

        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">
              大禹嶺山皇 <span class="text-base font-normal bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2 align-middle">精製茶</span>
            </h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">Dayuling Mountain King</p>
          </div>

          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">大禹嶺 (2300m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1">
                <div class="dot-filled"></div><div class="dot-filled"></div>
                <div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">
          以比賽級精製工藝去蕪存菁，凝鍊大禹嶺最純粹的山韻本味。滋味深厚飽滿，熟果花香交織成濃郁層次，茶氣渾厚稠滑，展現此區無可取代的高冷甘醇。
        </p>

        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#EEF2FF; color:#4338CA; border:1px solid #E0E7FF;">比賽級工藝</span>
          <span class="tag">山韻本味</span>
          <span class="tag">渾厚稠滑</span>
        </div>

        <div class="tea-tip">這是比賽級的工藝，把大禹嶺的優點都逼出來了，送禮超有面子。</div>

        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$2100</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$7600</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E5%A4%A7%E7%A6%B9%E5%B6%BA%E5%B1%B1%E7%9A%87" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>

      </div>
    </div>

  </div> <!-- ✅ 關閉：大禹嶺 grid -->
</div>   <!-- ✅ 關閉：大禹嶺區塊 -->

<!-- 福壽山茶區 -->
<div class="relative reveal-on-scroll">

  <div class="flex items-center gap-4 md:gap-6 mb-4 md:mb-12 px-4 md:px-2">
    <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">福壽山茶區</h2>
    <div class="h-[1px] bg-stone-300 flex-grow"></div>
    <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Fushoushan Premium</span>
  </div>
<div class="md:hidden -mt-2 mb-3 px-4"><span class="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm">滑動查看更多 <span class="swipe-arrow">→</span></span></div>

  <div class="grid grid-cols-1 gap-8 md:gap-12">
                <!-- 1. 福壽山唐莊茶 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319555244700014b6ad6a/800x.webp?source_format=jpg" alt="福壽山唐莊茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">福壽山唐莊茶</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Fushoushan Tang Zhuang</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">福壽山 (2500m)</p>
        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>
    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以渾厚氣息與金綠蜜韻為其特色，熟果香馥郁沁鼻。茶湯飽滿細緻、果膠質甘甜順滑，口感豐富而圓潤，展現獨有的深邃風味。</p>
    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F7F3ED; color:#8A7456;border:1px solid #E8E1D6;">金綠蜜韻</span>
      <span class="tag">熟果馥郁</span>
      <span class="tag">果膠順滑</span>
    </div>
    <div class="tea-tip">福壽山的茶有一種貴氣，這款帶有金綠色的茶湯，非常漂亮。</div>
    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1300</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$4800</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E5%94%90%E8%8E%8A%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 2. 福壽山義莊茶 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319575244700018b6ba20/800x.webp?source_format=jpg" alt="福壽山義莊茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">福壽山義莊茶</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Fushoushan Yi Zhuang</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">福壽山 (2500m)</p>
        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>
    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">香氣雅致帶蜜綠調，融合青蘋果與淡花香。茶湯果膠質豐富、甘醇耐沖，風味綿長持久。</p>
    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F7F3ED; color:#8A7456;border:1px solid #E8E1D6;">青蘋果香</span>
      <span class="tag">甘醇耐沖</span>
      <span class="tag">雅致蜜綠</span>
    </div>
    <div class="tea-tip">喜歡青蘋果香氣的朋友，這款一定要試試看，非常特別。</div>
    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1300</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$4800</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E7%BE%A9%E8%8E%8A%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 3. 福壽山天池（✅修正 1450g -> 150g） -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/69331948c5ecff00100ccb2d/800x.webp?source_format=jpg" alt="福壽山天池" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">福壽山天池</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Fushoushan Tian Chi</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">福壽山 (2600m)</p>
        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>
    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">生長於福壽山原始林最頂端的高海拔茶區，散發濃郁而深邃的山韻。茶湯厚實飽滿，原始林香氣四溢，青香醇雅而層次綿延。</p>
    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F7F3ED; color:#8A7456;border:1px solid #E8E1D6;">原始林氣</span>
      <span class="tag">深邃山韻</span>
      <span class="tag">青香醇雅</span>
    </div>
    <div class="tea-tip">天池的水氣很重，讓茶葉喝起來特別軟甜，是行家都在搶的茶。</div>
    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1500</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$5600</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E5%A4%A9%E6%B1%A0" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 4. 福壽山茶王 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/69331945056e86115a8ae629/800x.webp?source_format=jpg" alt="福壽山茶王" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">福壽山茶王</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Fushoushan Tea King</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">福壽山 (2500m)</p>
        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>
    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">生長於福壽山高冷山域的稀有輕發酵鐵觀音。展現獨特山韻與原始氣息；茶湯底韻渾厚，青甜香清雅上揚，甘醇而喉韻深長。</p>
    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F7F3ED; color:#8A7456;border:1px solid #E8E1D6;">高冷鐵觀音</span>
      <span class="tag">底韻渾厚</span>
      <span class="tag">青甜香</span>
    </div>
    <div class="tea-tip">輕發酵的鐵觀音做法，保留了高山茶的清爽又有鐵觀音的韻味，超酷！</div>
    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1700</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$6400</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E8%8C%B6%E7%8E%8B" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 5. 福壽山茶皇【精製茶】 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933191cbc5bcc000a3057b4/800x.webp?source_format=jpg" alt="福壽山茶皇" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">福壽山茶皇 <span class="text-base font-normal bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2 align-middle">精製茶</span></h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Fushoushan Emperor Tea</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">福壽山 (2600m)</p>
        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>
    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以比賽級精製工序去蕪存菁，展現 Bestea 代表性茶款的細膩醇滑與清甜飽滿。伴隨淡雅松香在口中綿延流轉，餘韻悠長而高雅。</p>
    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#EEF2FF; color:#4338CA; border:1px solid #E0E7FF;">比賽級工藝</span>
      <span class="tag">淡雅松香</span>
      <span class="tag">細膩醇滑</span>
    </div>
    <div class="tea-tip">茶中之皇！每一口都是享受，適合在重要時刻細細品嚐。</div>
    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$2400</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$8800</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E8%8C%B6%E7%9A%87" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

</div> <!-- ✅ 關閉：福壽山 grid -->
</div> <!-- ✅ 關閉：福壽山 section -->

<!-- 高山紅茶系列 -->
<div class="relative reveal-on-scroll">
  <div class="flex items-center gap-4 md:gap-6 mb-4 md:mb-12 px-4 md:px-2">
    <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">高山紅茶系列</h2>
    <div class="h-[1px] bg-stone-300 flex-grow"></div>
    <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Premium Black Tea</span>
  </div>
<div class="md:hidden -mt-2 mb-3 px-4"><span class="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm">滑動查看更多 <span class="swipe-arrow">→</span></span></div>

  <div class="grid grid-cols-1 gap-8 md:gap-12">

    <!-- 1. 日月潭紅玉 -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693318103b21f40012adaa82/800x.webp?source_format=jpg" alt="日月潭紅玉" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>
      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">日月潭紅玉</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">Ruby Black Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">日月潭 / 台茶十八號</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div></div>
            </div>
          </div>
        </div>
        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以醒目的薄荷與肉桂香交織果蜜焦糖氣息為特色。茶湯滑順醇厚、香韻馥郁，入喉後帶出獨有的清涼回韻，風味鮮明而迷人。</p>
        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#FDECEA; color:#C62828; border:1px solid #F5C1BC;">薄荷肉桂</span>
          <span class="tag">果蜜焦糖</span>
          <span class="tag">清涼回韻</span>
        </div>
        <div class="tea-tip">台茶18號！自帶薄荷跟肉桂香，加點鮮奶變成頂級鮮奶茶超讚。</div>
        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$650</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2400</span></div>
            </div>
            <a href="https://www.besttea1.com/zh-hant/products/ruby-black-tea" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 梨山紅茶（✅ 修正 2400g -> 600g） -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319baa23b8a000a491c79/800x.webp?source_format=jpg" alt="梨山紅茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>
      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">梨山紅茶</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Black Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">梨山 (1900m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div></div>
            </div>
          </div>
        </div>
        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">色澤鮮紅明亮、散發甜果香氣。茶湯入喉甘柔細緻、餘韻悠長持久，特有的清潤甜雅風味。</p>
        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#FDECEA; color:#C62828; border:1px solid #F5C1BC;">甜果香氣</span>
          <span class="tag">甘柔細緻</span>
          <span class="tag">清潤甜雅</span>
        </div>
        <div class="tea-tip">用高山茶做的紅茶，沒有一般紅茶的澀味，只有滿滿的甜味！</div>
        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$650</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2400</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E7%B4%85%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 鹿野紅烏龍 -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693317edf10a720018a7095b/800x.webp?source_format=jpg" alt="鹿野紅烏龍" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>
      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">鹿野紅烏龍</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">Luye Red Oolong</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">鹿野初鹿 (500m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div></div>
            </div>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">焙火度</span>
              <div class="flex gap-1"><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-empty"></div></div>
            </div>
          </div>
        </div>
        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">誕生於鹿野初鹿緩坡之間，融合紅茶的甜潤與烏龍的厚韻。經重焙火淬煉出熟果蜜香，茶湯醇厚圓滑、果韻柔甜綿延。</p>
        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#FDECEA; color:#C62828; border:1px solid #F5C1BC;">熟果蜜香</span>
          <span class="tag">紅茶甜潤</span>
          <span class="tag">烏龍厚韻</span>
        </div>
        <div class="tea-tip">台東鹿野的驕傲！喝起來像紅茶又像烏龍，帶有濃濃的熟果香。</div>
        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$900</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$3200</span></div>
            </div>
            <a href="https://www.besttea1.com/products/luye-red-oolong-tea" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 華崗紅茶 -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319689c53ab001039db17/800x.webp?source_format=jpg" alt="華崗紅茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>
      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">華崗紅茶</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">Hua Gang Black Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">梨山 (2400m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div></div>
            </div>
          </div>
        </div>
        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以瑰麗蜜紅茶湯與潔淨滑順的質地著稱。入口甘醇濃郁、果膠馥郁交織天然果酸，風味深邃而層次鮮明。</p>
        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#FDECEA; color:#C62828; border:1px solid #F5C1BC;">瑰麗蜜紅</span>
          <span class="tag">潔淨滑順</span>
          <span class="tag">天然果酸</span>
        </div>
        <div class="tea-tip">最高級的紅茶之一！因為生長慢，果膠超多，喝起來像在喝果汁。</div>
        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1150</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$4200</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E8%8F%AF%E5%B4%97%E7%B4%85%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. 福壽山紅茶【精製茶】（✅補齊你缺的閉合，這就是你壞掉的點） -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933190fbd944d00185d694d/800x.webp?source_format=jpg" alt="福壽山紅茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>
      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">福壽山紅茶 <span class="text-base font-normal bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2 align-middle">精製茶</span></h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">Fushoushan Black Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">福壽山 (2500m)</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div></div>
            </div>
          </div>
        </div>
        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">福壽山紅茶生於台灣最高海拔紅茶產區。茶湯呈現鮮豔琥珀色澤，入口潔淨柔甜伴隨濃郁熟果蜜香，風味馥郁而雅緻，展現高冷山頭特有的細膩深韻。</p>
        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#FDECEA; color:#C62828; border:1px solid #F5C1BC;">鮮豔琥珀</span>
          <span class="tag">濃郁熟果</span>
          <span class="tag">馥郁雅緻</span>
        </div>
        <div class="tea-tip">這可是總統級的紅茶，產量超級少，喝到真的算運氣好！</div>
        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1700</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$6400</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E7%B4%85%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>
      </div>
    </div>

  </div> <!-- ✅ 關閉：高山紅茶 grid -->
</div>   <!-- ✅ 關閉：高山紅茶 section -->


<!-- 珍稀茶系列 (白茶) -->
<div class="relative reveal-on-scroll">
  <div class="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 px-4 md:px-2">
    <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">珍稀茶系列</h2>
    <div class="h-[1px] bg-stone-300 flex-grow"></div>
    <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Rare White Tea</span>
  </div>

  <!-- 1. 梨山白茶 -->
  <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
    <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
      <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693317f865d674000eeba7a2/800x.webp?source_format=jpg" alt="梨山白茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
    </div>

    <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
      <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
        <div>
          <h3 class="text-stone-800 tracking-wide serif">梨山白茶</h3>
          <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan White Tea</p>
        </div>

        <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
          <p class="meta-text tracking-wide origin-text">梨山華崗 (2400m)</p>
          <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
            <span class="text-sm md:text-xl">發酵度</span>
            <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
          </div>
        </div>
      </div>

      <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">
        以高山冬芽繁工細製而成，呈現純淨而細緻的層次香韻。茶湯清甜滑順，帶淡雅果香，尾韻浮現柔柔蜜意，回甘乾淨悠長。
      </p>

      <div class="flex flex-wrap gap-3 my-3 flavor-tags">
        <span class="tag" style="background:#EEF5F3;color:#3F6B5A;border:1px solid #D7E7E1;">純淨細緻</span>
        <span class="tag">高山冬芽</span>
        <span class="tag">柔柔蜜意</span>
      </div>

      <div class="tea-tip">白茶在台灣很少見！這款喝起來像花蜜水一樣甜，非常珍貴。</div>

      <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
          <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
            <div class="flex items-baseline"><span class="unit-text mr-2">100g</span> <span class="price-tag">$1300</span></div>
            <span class="text-stone-300 font-light">|</span>
            <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$7200</span></div>
          </div>
          <a href="https://www.besttea1.com/products/lishan-white-tea" class="buy-btn shadow-sm">購買</a>
        </div>
      </div>

    </div>
  </div> <!-- ✅ 這個 product-card 的關閉你原本少了 -->
</div> <!-- ✅ 珍稀茶系列 section 關閉 -->


<!-- 精焙茶系列 -->
<div class="relative reveal-on-scroll">
  <div class="flex items-center gap-4 md:gap-6 mb-4 md:mb-12 px-4 md:px-2">
    <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">精焙茶系列</h2>
    <div class="h-[1px] bg-stone-300 flex-grow"></div>
    <span class="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light hidden sm:inline-block">Roasted Tea Series</span>
  </div>
<div class="md:hidden -mt-2 mb-3 px-4"><span class="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm">滑動查看更多 <span class="swipe-arrow">→</span></span></div>

  <div class="grid grid-cols-1 gap-8 md:gap-12">

    <!-- 1. 凍頂烏龍茶 -->
    <div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
      <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
        <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/69331a115fe468001017c436/800x.webp?source_format=jpg" alt="凍頂烏龍茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
      </div>
      <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
        <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 class="text-stone-800 tracking-wide serif">凍頂烏龍茶</h3>
            <p class="text-stone-400 mt-0 font-light tracking-wider">Dongding Oolong Tea</p>
          </div>
          <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
            <p class="meta-text tracking-wide origin-text">鹿谷「凍頂山」（800m）</p>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">發酵度</span>
              <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
            </div>
            <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
              <span class="text-sm md:text-xl">焙火度</span>
              <div class="flex gap-1"><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
            </div>
          </div>
        </div>
        <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以醇厚喉韻伴隨火烤焦糖氣息為特色。茶湯渾厚帶雅緻木質香，入口甘醇生津、餘韻悠長飽滿。</p>
        <div class="flex flex-wrap gap-3 my-3 flavor-tags">
          <span class="tag" style="background:#F6EFE9;color:#795548;border:1px solid #E5D3C8;">火烤焦糖</span>
          <span class="tag">醇厚喉韻</span>
          <span class="tag">木質香</span>
        </div>
        <div class="tea-tip">還是老味道最對味！經過烘焙的火香，喝完暖暖的。</div>
        <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
            <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
              <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$300</span></div>
              <span class="text-stone-300 font-light">|</span>
              <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$1000</span></div>
            </div>
            <a href="https://www.besttea1.com/products/%E5%87%8D%E9%A0%82%E7%83%8F%E9%BE%8D%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 梨山炭焙茶 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933191a353b73001808c349/800x.webp?source_format=jpg" alt="梨山炭焙茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">梨山炭焙茶</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Charcoal-Roasted Tea</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">梨山 (2000m)</p>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">焙火度</span>
          <div class="flex gap-1"><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>

    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">重度發酵襯出深邃炭火香，茶湯醇厚富含果膠。伴隨天然焙火韻在口中緩緩綻放，高山炭焙特有的溫潤厚實風味。</p>

    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F6EFE9;color:#795548;border:1px solid #E5D3C8;">深邃炭火</span>
      <span class="tag">果膠豐富</span>
      <span class="tag">溫潤厚實</span>
    </div>

    <div class="tea-tip">用炭火慢焙的高山茶，保留了甜度又多了層次，非常耐泡。</div>

    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$650</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2400</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E7%82%AD%E7%84%99%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 3. 梨山精焙茶 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319f729165600126124ad/800x.webp?source_format=jpg" alt="梨山精焙茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">梨山精焙茶</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Lishan Roasting Tea</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">梨山 (2000m)</p>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">焙火度</span>
          <div class="flex gap-1"><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>

    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以青心烏龍為基底，經細緻焙火淬鍊出溫厚茶韻。茶湯醇和帶熟果與焙香交織的深沉層次，入口滑順甘潤、餘韻沉靜綿長。</p>

    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F6EFE9;color:#795548;border:1px solid #E5D3C8;">溫厚茶韻</span>
      <span class="tag">熟果焙香</span>
      <span class="tag">滑順甘潤</span>
    </div>

    <div class="tea-tip">想要有焙火香又不想太重口味？選這款精焙茶剛剛好。</div>

    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$650</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$2400</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E6%A2%A8%E5%B1%B1%E7%B2%BE%E7%84%99%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 4. 大禹嶺精焙茶 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319ecbd944d000a5d684d/800x.webp?source_format=jpg" alt="大禹嶺精焙茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">大禹嶺精焙茶</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Dayuling Roasting Tea</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">大禹嶺 (2200m)</p>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">焙火度</span>
          <div class="flex gap-1"><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>

    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以細緻焙火淬煉半青熟韻，茶湯醇雅穩定。香氣溫潤層次豐富，展現高山熟香的深沉與優雅，是大禹嶺茶區少見的熟茶佳作。</p>

    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F6EFE9;color:#795548;border:1px solid #E5D3C8;">半青熟韻</span>
      <span class="tag">高山熟香</span>
      <span class="tag">深沉優雅</span>
    </div>

    <div class="tea-tip">大禹嶺的茶拿來焙火真的太奢侈了！但那種深沉的韻味真的無敵。</div>

    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$900</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$3200</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E5%A4%A7%E7%A6%B9%E5%B6%BA%E7%B2%BE%E7%84%99%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 5. 木柵鐵觀音 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6933180646f0d9000c107da6/800x.webp?source_format=jpg" alt="木柵鐵觀音" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>
  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">木柵鐵觀音</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Muzha Tieguanyin</p>
      </div>
      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">木柵指南 (370m)</p>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">焙火度</span>
          <div class="flex gap-1"><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>

    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">以木柵指南的傳統炭焙工藝淬鍊而成，濃醇花果香層層綻放。茶湯甘醇厚實、蜜韻綿延，喉韻深邃而富有立體感，正宗的鐵觀音韻味。</p>

    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F6EFE9;color:#795548;border:1px solid #E5D3C8;">濃醇花果</span>
      <span class="tag">蜜韻綿延</span>
      <span class="tag">立體喉韻</span>
    </div>

    <div class="tea-tip">正宗木柵鐵觀音！那種微酸的「觀音韻」才是正港的台灣味。</div>

    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">100g</span> <span class="price-tag">$700</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$3600</span></div>
        </div>
        <a href="https://www.besttea1.com/products/muzha-tieguanyin" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

<!-- 6. 福壽山精焙茶 -->
<div class="product-card rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group bg-white">
  <div class="md:w-4/12 relative flex items-center justify-center p-6 bg-stone-50/30">
    <img loading="lazy" decoding="async" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/693319e377ee3c000e0df138/800x.webp?source_format=jpg" alt="福壽山精焙茶" class="w-auto max-h-[360px] object-contain mx-auto drop-shadow-sm">
  </div>

  <div class="md:w-8/12 p-6 md:p-10 flex flex-col justify-center">
    <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
      <div>
        <h3 class="text-stone-800 tracking-wide serif">福壽山精焙茶</h3>
        <p class="text-stone-400 mt-0 font-light tracking-wider">Fushoushan Roasted Tea</p>
      </div>

      <div class="text-left md:text-right mt-2 md:mt-0 origin-ferment">
        <p class="meta-text tracking-wide origin-text">福壽山 (2400m)</p>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">發酵度</span>
          <div class="flex gap-1"><div class="dot-filled"></div><div class="dot-filled"></div><div class="dot-empty"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>

        <div class="flex items-center gap-2 mt-1 justify-start md:justify-end meta-text">
          <span class="text-sm md:text-xl">焙火度</span>
          <div class="flex gap-1"><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-filled-fire"></div><div class="dot-empty"></div><div class="dot-empty"></div></div>
        </div>
      </div>
    </div>

    <p class="text-stone-600 leading-relaxed mb-6 font-light description-text">
      以福壽山高冷茶區精心焙製而成，質地醇厚飽滿。富含高山果膠，入口柔滑帶出自然熟果香緩緩綻放，層次深邃而馥郁悠長。
    </p>

    <div class="flex flex-wrap gap-3 my-3 flavor-tags">
      <span class="tag" style="background:#F6EFE9;color:#795548;border:1px solid #E5D3C8;">高山果膠</span>
      <span class="tag">自然熟果</span>
      <span class="tag">層次深邃</span>
    </div>

    <div class="tea-tip">福壽山的底子加上精湛的焙火，這款茶濃郁到會化不開！</div>

    <div class="bg-stone-50 p-6 rounded-lg mt-auto border border-stone-100/80 flex flex-col gap-4 price-area">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 price-row">
        <div class="text-stone-800 flex items-baseline gap-4 w-full sm:w-auto">
          <div class="flex items-baseline"><span class="unit-text mr-2">150g</span> <span class="price-tag">$1150</span></div>
          <span class="text-stone-300 font-light">|</span>
          <div class="flex items-baseline"><span class="unit-text mr-2">600g</span> <span class="price-tag">$4200</span></div>
        </div>
        <a href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E7%B2%BE%E7%84%99%E8%8C%B6" class="buy-btn shadow-sm">購買</a>
      </div>
    </div>
  </div>
</div>

</div> <!-- ✅ 關閉：精焙茶系列 grid -->
</div> <!-- ✅ 關閉：精焙茶系列 section -->

</div> <!-- ✅ 關閉：products-container -->
</section>


<div id="daily-tastea-original-leaf">

    <div class="dt-container">

      <!-- 標題列 -->

      <div class="relative dt-header">

          <!-- 內容容器 -->

          <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mb-4 md:mb-12">

              <!-- 主標題 -->

              <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">原葉茶包・天天好茶系列</h2>

              

              <!-- 桌面分隔線 -->

              <div class="h-[1px] bg-stone-300 flex-grow hidden md:block"></div>

              

              <!-- 副標題與滑動提示 -->

              <div class="flex items-center justify-between w-full md:w-auto gap-4 mt-1 md:mt-0">

                  <span class="text-stone-400 text-sm md:text-lg tracking-widest uppercase font-light">DAILY TASTEA · ORIGINAL LEAF</span>

                  <!-- 滑動提示 (僅手機版顯示) -->

                  <div class="inline-flex md:hidden items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm whitespace-nowrap">

                      滑動查看更多 <span class="swipe-arrow">→</span>

                  </div>

              </div>

          </div>

      </div>



      <!-- 商品列表 -->

      <div class="dt-list">



        <!-- 1. 醇翠烏龍 -->

        <div class="product-card">

          <div class="pc-image-wrap bg-chun-cui">

            <img loading="lazy" decoding="async" class="pc-image" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6774ce6faee05800103576ed/800x.webp?source_format=jpg" alt="醇翠烏龍 Chun Cui Oolong">

          </div>

          <div class="pc-body">

            <div class="pc-header-row">

              <div>

                <h3 class="pc-name">醇翠烏龍</h3>

                <p class="pc-en-name">Chun Cui Oolong</p>

              </div>

              <div class="pc-origin">產地：梨山 /烏龍</div>

            </div>

            <p class="pc-desc">

              蘭花冷香清雅上揚，茶湯柔滑帶細緻果膠感，風味純淨舒爽，餘韻自然清甜。

            </p>

            <div class="pc-tags">

              <span class="tag tag-teal">蘭花冷香</span>

              <span class="tag tag-blue">柔滑果膠感</span>

              <span class="tag tag-green">清甜餘韻</span>

            </div>

            <div class="pc-footer">

              <div class="pc-price-row">

                <div class="pc-price-main">

                  <span class="pc-price">$360</span>

                  <span class="pc-unit">(12入)</span>

                </div>

              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/chun-cui-oolong-12-original-leaf-tea-bags">

                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>

              </a>

            </div>

          </div>

        </div>



        <!-- 2. 奶香金萱 -->

        <div class="product-card">

          <div class="pc-image-wrap bg-milky-jinxuan">

            <img loading="lazy" decoding="async" class="pc-image" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6774ccf9fc718a000f10b4be/800x.webp?source_format=jpg" alt="奶香金萱 Milky Jinxuan">

          </div>

          <div class="pc-body">

            <div class="pc-header-row">

              <div>

                <h3 class="pc-name">奶香金萱</h3>

                <p class="pc-en-name">Milky Jinxuan</p>

              </div>

              <div class="pc-origin">產地：阿里山 / 金萱</div>

            </div>

            <p class="pc-desc">

              以台茶十二號為基底，奶香濃郁而柔滑，交織清新的草本甜潤，風味細膩迷人。

            </p>

            <div class="pc-tags">

              <span class="tag tag-yellow">奶香濃郁</span>

              <span class="tag tag-orange">柔滑甜潤</span>

              <span class="tag tag-brown">細膩層次</span>

            </div>

            <div class="pc-footer">

              <div class="pc-price-row">

                <div class="pc-price-main">

                  <span class="pc-price">$360</span>

                  <span class="pc-unit">(12入)</span>

                </div>

              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/milky-jinxuan%EF%BD%9Coriginal-leaf-tea-bags-12-pieces">

                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>

              </a>

            </div>

          </div>

        </div>



        <!-- 3. 悠悠紅玉 -->

        <div class="product-card">

          <div class="pc-image-wrap bg-ruby-black">

            <img loading="lazy" decoding="async" class="pc-image" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6774ce427627cf000c764759/800x.webp?source_format=jpg" alt="悠悠紅玉 Ruby Black Tea">

          </div>

          <div class="pc-body">

            <div class="pc-header-row">

              <div>

                <h3 class="pc-name">悠悠紅玉</h3>

                <p class="pc-en-name">Ruby Black Tea</p>

              </div>

              <div class="pc-origin">產地：日月潭 / 紅玉</div>

            </div>

            <p class="pc-desc">

              嚴選日月潭頂級紅玉，薄荷與肉桂香氣交織，伴隨果蜜與焦糖韻調，茶湯清爽滑順。

            </p>

            <div class="pc-tags">

              <span class="tag tag-red">薄荷肉桂</span>

              <span class="tag tag-orange">果蜜焦糖</span>

              <span class="tag tag-red">清爽滑順</span>

            </div>

            <div class="pc-footer">

              <div class="pc-price-row">

                <div class="pc-price-main">

                  <span class="pc-price">$360</span>

                  <span class="pc-unit">(12入)</span>

                </div>

              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/ruby-black-tea%EF%BD%9Coriginal-leaf-tea-bags-12-pieces">

                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>

              </a>

            </div>

          </div>

        </div>



        <!-- 4. 暮暮觀音 -->

        <div class="product-card">

          <div class="pc-image-wrap bg-mellow-tgy">

            <img loading="lazy" decoding="async" class="pc-image" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6774ce5d63c5b8000d4f4276/800x.webp?source_format=jpg" alt="暮暮觀音 Mellow Tieguanyin">

          </div>

          <div class="pc-body">

            <div class="pc-header-row">

              <div>

                <h3 class="pc-name">暮暮觀音</h3>

                <p class="pc-en-name">Mellow Tieguanyin</p>

              </div>

              <div class="pc-origin">產地：梨山 / 鐵觀音</div>

            </div>

            <p class="pc-desc">

              深烘焙凝鍊出厚實風韻，焦香與微酸果香交織；茶湯滑順飽滿，展現鐵觀音獨有的沉穩層次。

            </p>

            <div class="pc-tags">

              <span class="tag tag-brown">深焙厚實</span>

              <span class="tag tag-orange">焦香微果酸</span>

              <span class="tag tag-yellow">飽滿層次</span>

            </div>

            <div class="pc-footer">

              <div class="pc-price-row">

                <div class="pc-price-main">

                  <span class="pc-price">$360</span>

                  <span class="pc-unit">(12入)</span>

                </div>

              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/twilight-guanyin%EF%BD%9C12-original-leaf-tea-bags">

                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>

              </a>

            </div>

          </div>

        </div>



        <!-- 5. 芬芳的總和 -->

        <div class="product-card">

          <div class="pc-image-wrap bg-comprehensive">

            <img loading="lazy" decoding="async" class="pc-image" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6774cf2d611a6a000bec6fe2/800x.webp?source_format=jpg" alt="芬芳的總和 Comprehensive">

          </div>

          <div class="pc-body">

            <div class="pc-header-row">

              <div>

                <h3 class="pc-name">芬芳的總和</h3>

                <p class="pc-en-name">Comprehensive</p>

              </div>

              <div class="pc-origin">綜合原葉茶包</div>

            </div>

            <p class="pc-desc">

              來自台灣精選原葉，以立體茶包緩緩舒展層次香韻，清雅而飽滿。無論靜心時刻或餐後放鬆皆宜。

            </p>

            <div class="pc-tags">

              <span class="tag tag-purple">花果香氣</span>

              <span class="tag tag-blue">清雅飽滿</span>

              <span class="tag tag-green">舒適清爽</span>

            </div>

            <div class="pc-footer">

              <div class="pc-price-row">

                <div class="pc-price-main">

                  <span class="pc-price">$360</span>

                  <span class="pc-unit">(12入)</span>

                </div>

              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/comprehensive%EF%BD%9Coriginal-leaf-tea-bags-12-pieces">

                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>

              </a>

            </div>

          </div>

        </div>



        <!-- 6. 天天好茶禮盒 -->

        <div class="product-card">

          <div class="pc-image-wrap bg-gift-box">

            <img loading="lazy" decoding="async" class="pc-image" src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/67e2269a2e6fcf0011d1000b/800x.webp?source_format=jpg" alt="天天好茶禮盒 Gift Box">

          </div>

          <div class="pc-body">

            <div class="pc-header-row">

              <div>

                <h3 class="pc-name">天天好茶禮盒</h3>

                <p class="pc-en-name">Gift Box</p>

              </div>

              <div class="pc-origin">綜合原葉茶包 · 禮盒</div>

            </div>

            <p class="pc-desc">

              高山晨露中的原葉茶包，隨熱水舒展而釋放層層茶香。以茶為禮，款待最重要的貴賓。

            </p>

            <div class="pc-tags">

              <span class="tag tag-red">溫潤茶香</span>

              <span class="tag tag-purple">優雅送禮</span>

              <span class="tag tag-green">高山原葉</span>

            </div>

            <div class="pc-footer">

              <div class="pc-price-row">

                <div class="pc-price-main">

                  <span class="pc-price">$660</span>

                  <span class="pc-unit">(20入)</span>

                </div>

              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/daily-tastea-gift-box">

                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>

              </a>

            </div>

          </div>

        </div>



         <!-- 7. 原葉大份量茶包 -->
        <div class="product-card">
          <div class="pc-image-wrap bg-wholeleaf-bulk">
            <img loading="lazy" decoding="async" class="pc-image"
                 src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/6774bfd03071c2000be9b685/800x.webp?source_format=jpg"
                 alt="原葉大份量茶包 Whole Leaf Bulk">
          </div>

          <div class="pc-body">
            <div class="pc-header-row">
              <div>
                <h3 class="pc-name">原葉大份量茶包</h3>
                <p class="pc-en-name">Whole Leaf Bulk</p>
              </div>
              <div class="pc-origin">大份量補貨</div>
            </div>

            <p class="pc-desc">以環保與簡約為初心，推出大份量的原葉茶包，回歸自然、品味純粹。附絨布袋，方便收納。</p>

            <div class="pc-tags">
              <span class="tag tag-green">環保簡約</span>
              <span class="tag tag-blue">大份量補貨</span>
              <span class="tag tag-yellow">多款茶型選擇</span>
            </div>

            <div class="pc-footer">
              <div class="pc-price-row">
                <div class="pc-price-main">
                  <span class="pc-unit">100入</span>
                  <span class="pc-price">$2500</span>
                </div>
                <div class="pc-price-main">
                  <span class="pc-unit">300入</span>
                  <span class="pc-price">$7200</span>
                </div>
              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/generous-portion-tea-bags">
                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>
              </a>
            </div>
          </div>
        </div>

      </div><!-- /.dt-list -->
    </div><!-- /.dt-container -->
  </div><!-- /#daily-tastea-original-leaf -->

<div id="classic-flat-tea-bags">
    <div class="dt-container">

      <!-- 標題列 -->
      <div class="relative dt-header">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mb-4 md:mb-12">
          <h2 class="text-3xl md:text-5xl font-bold text-stone-800 serif tracking-wide">平面茶包・經典好茶系列</h2>
          <div class="h-[1px] bg-stone-300 flex-grow hidden md:block"></div>

          <div class="flex items-center justify-between w-full md:w-auto gap-4 mt-1 md:mt-0">
            <span class="text-stone-400 text-sm md:text-lg tracking-widest uppercase font-light">CLASSIC FLAT TEA BAGS</span>
            <div class="inline-flex md:hidden items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 shadow-sm whitespace-nowrap">
              滑動查看更多 <span class="swipe-arrow">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="dt-list">

        <!-- 1. 大禹嶺茶包 -->
        <div class="product-card">
          <div class="pc-image-wrap bg-flat-dayuling">
            <img loading="lazy" decoding="async" class="pc-image"
                 src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/666d192febc48600169c3515/800x.webp?source_format=jpg"
                 alt="大禹嶺茶包 Dayuling Tea Bags">
          </div>
          <div class="pc-body">
            <div class="pc-header-row">
              <div>
                <h3 class="pc-name">大禹嶺茶包</h3>
                <p class="pc-en-name">Dayuling Tea Bags</p>
              </div>
              <div class="pc-origin">產地：大禹嶺（2300m）</div>
            </div>
            <p class="pc-desc">茶水香甜、入口生津回甘，茶湯柔順而喉韻清雅，大禹嶺高海拔茶獨有的純淨甜潤。</p>
            <div class="pc-tags">
              <span class="tag tag-green">高海拔茶香</span>
              <span class="tag tag-blue">柔順回甘</span>
              <span class="tag tag-teal">純淨甜潤</span>
            </div>
            <div class="pc-footer">
              <div class="pc-price-row">
                <div class="pc-price-main">
                  <span class="pc-price">$300</span>
                  <span class="pc-unit">(30入)</span>
                </div>
              </div>
              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/%E5%A4%A7%E7%A6%B9%E5%B6%BA%E8%8C%B6%E5%8C%85">
                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 2. 福壽山茶包 -->
        <div class="product-card">
          <div class="pc-image-wrap bg-flat-fushou">
            <img loading="lazy" decoding="async" class="pc-image"
                 src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/666d17c3442bf500168446a7/800x.webp?source_format=jpg"
                 alt="福壽山茶包 Fushoushan Tea Bags">
          </div>
          <div class="pc-body">
            <div class="pc-header-row">
              <div>
                <h3 class="pc-name">福壽山茶包</h3>
                <p class="pc-en-name">Fushoushan Tea Bags</p>
              </div>
              <div class="pc-origin">產地：福壽山（2500m）</div>
            </div>
            <p class="pc-desc">生長於福壽山 2500 公尺高冷茶區，茶湯清香甘甜，質地滑順柔和，層次渾厚。</p>
            <div class="pc-tags">
              <span class="tag tag-blue">高冷茶區</span>
              <span class="tag tag-teal">清香甘甜</span>
              <span class="tag tag-green">滑順渾厚</span>
            </div>
            <div class="pc-footer">
              <div class="pc-price-row">
                <div class="pc-price-main">
                  <span class="pc-price">$500</span>
                  <span class="pc-unit">(30入)</span>
                </div>
              </div>
              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/%E7%A6%8F%E5%A3%BD%E5%B1%B1%E8%8C%B6%E5%8C%85">
                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 3. 焙烏龍茶包 -->
        <div class="product-card">
          <div class="pc-image-wrap bg-flat-roasted">
            <img loading="lazy" decoding="async" class="pc-image"
                 src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/68abf33a05c16f7b3a13ec41/800x.webp?source_format=jpg"
                 alt="焙烏龍茶包 Roasted Oolong Tea Bags">
          </div>
          <div class="pc-body">
            <div class="pc-header-row">
              <div>
                <h3 class="pc-name">焙烏龍茶包</h3>
                <p class="pc-en-name">Roasted Oolong Tea Bags</p>
              </div>
              <div class="pc-origin">產地：杉林溪（1800m）</div>
            </div>
            <p class="pc-desc">焙火香氣濃雅，熟果氣息層次深沉，茶湯醇厚甘潤、焙韻綿長，入口滑順而沉靜。</p>
            <div class="pc-tags">
              <span class="tag tag-brown">濃雅焙火</span>
              <span class="tag tag-orange">熟果層次</span>
              <span class="tag tag-yellow">醇厚甘潤</span>
            </div>
            <div class="pc-footer">
              <div class="pc-price-row">
                <div class="pc-price-main">
                  <span class="pc-price">$500</span>
                  <span class="pc-unit">(30入)</span>
                </div>
              </div>
              <a class="pc-btn" target="_self" href="https://www.besttea1.com/zh-hant/products/roasted-oolong-tea-bags">
                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 4. 華崗紅茶包 -->
        <div class="product-card">
          <div class="pc-image-wrap bg-flat-huagang">
            <img loading="lazy" decoding="async" class="pc-image"
                 src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/666d17c6e12266000d1dc32a/800x.webp?source_format=jpg"
                 alt="華崗紅茶包 Huagang Black Tea Bags">
          </div>
          <div class="pc-body">
            <div class="pc-header-row">
              <div>
                <h3 class="pc-name">華崗紅茶包</h3>
                <p class="pc-en-name">Huagang Black Tea Bags</p>
              </div>
              <div class="pc-origin">產地：梨山華崗（2400m）</div>
            </div>
            <p class="pc-desc">茶湯鮮紅明亮，散發濃郁甜果香，入口柔軟甘甜、餘韻細長悠遠。</p>
            <div class="pc-tags">
              <span class="tag tag-red">鮮紅茶湯</span>
              <span class="tag tag-orange">甜果香氣</span>
              <span class="tag tag-purple">餘韻悠長</span>
            </div>
            <div class="pc-footer">
              <div class="pc-price-row">
                <div class="pc-price-main">
                  <span class="pc-price">$500</span>
                  <span class="pc-unit">(30入)</span>
                </div>
              </div>
              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/%E8%8F%AF%E5%B4%97%E7%B4%85%E8%8C%B6%E8%8C%B6%E5%8C%85">
                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 5. 平面大份量茶包 -->
        <div class="product-card">
          <div class="pc-image-wrap bg-flat-bulk">
            <img loading="lazy" decoding="async" class="pc-image"
                 src="https://shoplineimg.com/5d202d62ec3a6d00018445e0/691ea633e405890016423824/800x.webp?source_format=jpg"
                 alt="平面大份量茶包 Flat Tea Bags Bulk">
          </div>

          <div class="pc-body">
            <div class="pc-header-row">
              <div>
                <h3 class="pc-name">平面大份量茶包</h3>
                <p class="pc-en-name">Flat Tea Bags Bulk</p>
              </div>
              <div class="pc-origin">大份量補貨</div>
            </div>

            <p class="pc-desc">以環保與簡約為初心，推出大份量的平面茶包，回歸自然、品味純粹。附帆布袋。</p>

            <div class="pc-tags">
              <span class="tag tag-green">日常補貨首選</span>
              <span class="tag tag-blue">環保簡約包裝</span>
              <span class="tag tag-yellow">多款茶型選擇</span>
            </div>

            <div class="pc-footer">
              <div class="pc-price-block">
                <div class="pc-price-row">
                  <div class="pc-price-main">
                    <span class="pc-unit">大禹嶺 100/200入</span>
                    <span class="pc-price">$800 / $1500</span>
                  </div>
                </div>
                <div class="pc-price-row">
                  <div class="pc-price-main">
                    <span class="pc-unit">其他款 100/200入</span>
                    <span class="pc-price">$1300 / $2500</span>
                  </div>
                </div>
              </div>

              <a class="pc-btn" target="_self" href="https://www.besttea1.com/products/%E5%A4%A7%E4%BB%BD%E9%87%8F%E5%B9%B3%E9%9D%A2%E8%8C%B6%E5%8C%85">
                購買 <i data-lucide="shopping-bag" width="18" height="18"></i>
              </a>
            </div>
          </div>
        </div>

      </div><!-- /.dt-list -->
    </div><!-- /.dt-container -->
  </div><!-- /#classic-flat-tea-bags -->

<div id="tea-ritual-wrapper">

  <div class="tr-container">

    

    <!-- Header Section -->

    <div class="tr-header">

      <div class="tr-bg-pattern">

        <svg viewBox="0 0 100 100" width="100%" height="100%">

          <path d="M0 50 Q 25 25, 50 50 T 100 50" fill="none" stroke="currentColor" stroke-width="0.5"/>

          <path d="M0 60 Q 25 35, 50 60 T 100 60" fill="none" stroke="currentColor" stroke-width="0.5"/>

        </svg>

      </div>

      <h2 class="tr-title">一期一會</h2>

      <p class="tr-subtitle">

        茶，是水的靈魂，也是生活的餘韻。<br>

        在繁忙的日常中，願您能找到屬於自己的那杯茶，安頓身心。

      </p>

    </div>



    <!-- Navigation Tabs -->

    <div class="tr-tabs">

      <button type="button" class="tr-tab-btn active" data-tr-tab="selection">尋找茶韻</button>

      <button type="button" class="tr-tab-btn" data-tr-tab="brewing">沖泡儀式</button>

    </div>



    <!-- Content Area -->

    <div class="tr-content">

      

      <!-- Tab 1: Tea Selection -->

      <div id="tab-selection" class="tr-tab-content active">

        <div class="tr-section-header">

          <h3>您偏好哪種風味？</h3>

          <p>點擊下方選項，探索您的味蕾嚮導</p>

        </div>



        <div class="tr-mood-grid">

          <!-- Fresh (Was Morning) -->

          <button type="button" class="tr-mood-btn tr-btn-fresh" data-tr-mood="fresh">

            <div class="tr-icon">

              <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"/><path d="M12 22v-9"/><path d="M9 8c-3.5 0-6 3.5-6 8h6Z"/><path d="M15 8c3.5 0 6 3.5 6 8h-6Z"/><path d="M12 8c0-3 2.5-5 5-5s2.5 2 2.5 5"/></svg>

            </div>

            <span>清香甘甜</span>

          </button>

          

          <!-- Rich (Was Afternoon) -->

          <button type="button" class="tr-mood-btn tr-btn-rich" data-tr-mood="rich">

            <div class="tr-icon">

              <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>

            </div>

            <span>醇厚果韻</span>

          </button>



          <!-- Mellow (Was Evening) -->

          <button type="button" class="tr-mood-btn tr-btn-mellow" data-tr-mood="mellow">

            <div class="tr-icon">

              <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19h8a4 4 0 0 0 3.8-2.8 4 4 0 0 0-1.6-4.5c.3-3.9-2.9-7-6.2-6.7-2.6.2-4.7 2.1-5 4.7A4 4 0 0 0 2 15a4 4 0 0 0 6 4Z"/></svg>

            </div>

            <span>溫潤陳韻</span>

          </button>

        </div>



        <!-- Result Area -->

        <div id="mood-result-container" class="tr-result-card" style="display: none;">

          <div class="tr-result-heart">

            <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>

          </div>

          <h4 id="result-title"></h4>

          <p id="result-desc"></p>

          <div class="tr-note-badge">

            <span id="result-note"></span>

          </div>
          <a id="tr-result-link" class="tr-result-link" href="#" style="display:none;">前往選購 →</a>

        </div>

      </div>



      <!-- Tab 2: Brewing Guide -->

      <div id="tab-brewing" class="tr-tab-content" style="display: none;">

        <div class="tr-section-header">

          <h3>慢下來的藝術</h3>

          <p>好的茶湯，源自於對細節的溫柔</p>

        </div>



        <!-- Basic Steps -->

        <div class="tr-steps-grid">

          <!-- Step 1 -->

          <div class="tr-step-item">

            <div class="tr-step-row-header">

              <div class="tr-step-icon">

                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M10 20h4"/><path d="M15 2v2"/><path d="M9 2v2"/></svg>

              </div>

              <h4><span>01</span> 溫壺</h4>

            </div>

            <p class="tr-step-desc">以熱水溫熱茶具，讓茶葉在落入壺中時，能先被溫度擁抱。</p>

          </div>

          

          <!-- Step 2 -->

          <div class="tr-step-item">

            <div class="tr-step-row-header">

              <div class="tr-step-icon">

                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>

              </div>

              <h4><span>02</span> 醒茶</h4>

            </div>

            <p class="tr-step-desc">第一注水無需過久，輕輕喚醒沉睡的茶葉，隨即倒出，釋放初香。</p>

          </div>

          

          <!-- Step 3 -->

          <div class="tr-step-item">

            <div class="tr-step-row-header">

              <div class="tr-step-icon">

                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>

              </div>

              <h4><span>03</span> 靜候</h4>

            </div>

            <p class="tr-step-desc">給予時間與耐心。好的風味，值得在 50 至 60 秒的等待中慢慢綻放。</p>

          </div>

          

          <!-- Step 4 -->

          <div class="tr-step-item">

             <div class="tr-step-row-header">

               <div class="tr-step-icon">

                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>

               </div>

               <h4><span>04</span> 品味</h4>

             </div>

             <p class="tr-step-desc">先聞其香，再嚐其味。這不只是一杯茶，而是與自己對話的時刻。</p>

          </div>

        </div>



        <!-- Detailed Parameters Section -->

        <div class="tr-divider"></div>

        

        <div class="tr-section-header" style="margin-top: 40px; margin-bottom: 30px;">

           <h3>建議沖泡方式</h3>

           <p class="tr-subtitle-text">黃金比例與冷熱萃取指南</p>

        </div>



        <div class="tr-params-grid">

          <!-- Card 1: Golden Ratio -->

          <div class="tr-param-card tr-card-golden">

             <div class="tr-param-icon-box">

                <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>

             </div>

             <h5 class="tr-param-title">熱泡黃金比例</h5>

             <p class="tr-param-subtitle">經典風味．層次豐富</p>

             

             <div class="tr-param-content">

                <div class="tr-param-row"><span class="tr-param-label">球型茶量</span><span class="tr-param-val">8-10g / 150ml</span></div>
                <div class="tr-param-row"><span class="tr-param-label">條型茶量</span><span class="tr-param-val">3-5g / 150ml</span></div>

                <div class="tr-param-row">

                   <span class="tr-param-label">沖泡時間</span>

                   <span class="tr-param-val">靜置 60 秒</span>

                </div>

                <div class="tr-param-note">

                   💡 品飲秘訣：<br>可依個人口味調整濃淡，感受層次變化。

                </div>

             </div>

          </div>



          <!-- Card 2: Black Tea Specific -->

          <div class="tr-param-card tr-card-blacktea">

             <div class="tr-param-icon-box">

                <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>

             </div>

             <h5 class="tr-param-title">紅茶專門泡法</h5>

             <p class="tr-param-subtitle">滾燙熱水．釋放果韻</p>



             <div class="tr-param-content">

                <div class="tr-param-row">

                   <span class="tr-param-label">水溫</span>

                   <span class="tr-param-val highlight">95°C 熱水</span>

                </div>

                <div class="tr-param-row"><span class="tr-param-label">球型比例</span><span class="tr-param-val">1:20</span></div>
                <div class="tr-param-row"><span class="tr-param-label">條型比例</span><span class="tr-param-val">1:40</span></div>

                <div class="tr-param-row">

                   <span class="tr-param-label">回沖</span>

                   <span class="tr-param-val">4-6 泡以上</span>

                </div>

             </div>

          </div>



          <!-- Card 3: Cold Brew -->

          <div class="tr-param-card tr-card-coldbrew">

             <div class="tr-param-icon-box">

                <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>

             </div>

             <h5 class="tr-param-title">清爽冷泡方式</h5>

             <p class="tr-param-subtitle">甘甜不澀．沁涼首選</p>

             

             <div class="tr-param-content">

                <div class="tr-param-row">

                   <span class="tr-param-label">比例</span>

                   <span class="tr-param-val">1g : 100ml 水</span>

                </div>

                <div class="tr-param-row">

                   <span class="tr-param-label">方式</span>

                   <span class="tr-param-val">置入水瓶注滿</span>

                </div>

                <div class="tr-param-row">

                   <span class="tr-param-label">時間</span>

                   <span class="tr-param-val">冷藏 6-8 小時</span>

                </div>

             </div>

          </div>

        </div>

        

        <div class="tr-cta">

           <p>* 以上為建議泡法，可依個人喜好調整濃度。</p>

        </div>

      </div>



    </div>

    

    <!-- Footer Text -->

    <div class="tr-footer">

        <p>Simple . Pure . Life</p>

    </div>

  </div>

</div>




<style>


#tea-ritual-wrapper {

  background-color: #fafaf9;

  /* 左右 padding 拿掉，讓電腦版更寬一些 */

  padding: 10px 0 60px 0;

  font-family: "Noto Serif TC", "Songti TC", serif;

  color: #292524;

  line-height: 1.6;

  width: 100%;

  box-sizing: border-box;

}



#tea-ritual-wrapper .tr-container {

  max-width: 1280px;   /* 想再寬就改 1280 / 1400 都可以 */

  width: 100%;

  margin: 0 auto;

  background-color: #ffffff;

  border-radius: 20px;

  box-shadow: 0 15px 40px rgba(0,0,0,0.05);

  overflow: hidden;

}



/* Header */

#tea-ritual-wrapper .tr-header {

  background-color: #1c1917;

  color: #f5f5f4;

  padding: 80px 30px;

  text-align: center;

  position: relative;

  overflow: hidden;

}



#tea-ritual-wrapper .tr-bg-pattern {

  position: absolute;

  top: 0;

  left: 0;

  width: 100%;

  height: 100%;

  opacity: 0.1;

  pointer-events: none;

}



#tea-ritual-wrapper .tr-title {

  font-size: 5.8rem; 

  letter-spacing: 0.1em;

  margin: 0 0 30px 0;

  font-weight: 400;

  color: #fff;

}



#tea-ritual-wrapper .tr-subtitle {

  color: #a8a29e;

  font-size: 2.2rem; 

  max-width: 900px;

  margin: 0 auto;

  font-weight: 300;

  letter-spacing: 0.05em;

  font-family: sans-serif;

  line-height: 1.8;

}



/* Tabs */

#tea-ritual-wrapper .tr-tabs {

  display: flex;

  border-bottom: 1px solid #f5f5f4;

}



#tea-ritual-wrapper .tr-tab-btn {

  flex: 1;

  padding: 40px 15px;

  font-size: 2.1rem; 

  letter-spacing: 0.1em;

  border: none;

  background: #fafaf9;

  color: #a8a29e;

  cursor: pointer;

  transition: all 0.3s ease;

  font-family: inherit;

}



#tea-ritual-wrapper .tr-tab-btn.active {

  background: #ffffff;

  color: #1c1917;

  font-weight: 500;

  border-top: 6px solid #1c1917;

}



#tea-ritual-wrapper .tr-tab-btn:hover:not(.active) {

  color: #57534e;

}



/* Content */

#tea-ritual-wrapper .tr-content {

  padding: 70px 40px;

  min-height: 550px;

}



#tea-ritual-wrapper .tr-section-header {

  text-align: center;

  margin-bottom: 60px;

}



#tea-ritual-wrapper .tr-section-header h3 {

  font-size: 2.9rem;

  color: #44403c;

  margin: 0 0 15px 0;

  font-weight: 400;

}



#tea-ritual-wrapper .tr-section-header p,

#tea-ritual-wrapper .tr-subtitle-text {

  color: #78716c;

  font-size: 2.0rem;

  margin: 0;

  font-family: sans-serif;

}



#tea-ritual-wrapper .tr-subtitle-text {

  font-size: 1.75em;

}



/* Grid Layouts */

#tea-ritual-wrapper .tr-mood-grid {

  display: grid;

  grid-template-columns: repeat(1, 1fr);

  gap: 30px;

  margin-bottom: 60px;

  max-width: 1100px;

  margin-left: auto;

  margin-right: auto;

}



@media (min-width: 768px) {

  #tea-ritual-wrapper .tr-mood-grid {

    grid-template-columns: repeat(3, 1fr);

  }

}



#tea-ritual-wrapper .tr-mood-btn {

  padding: 40px 30px;

  border-radius: 16px;

  border: 1px solid #e7e5e4;

  background: #fff;

  cursor: pointer;

  transition: all 0.3s ease;

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 20px;

}



/* Mood/Flavor Colors (Updated) */

/* Fresh (Oolong) - Yellow */

#tea-ritual-wrapper .tr-mood-btn.tr-btn-fresh { background: #fffbf0; border-color: #fce7b0; }

#tea-ritual-wrapper .tr-mood-btn.tr-btn-fresh .tr-icon { color: #d97706; }

#tea-ritual-wrapper .tr-mood-btn.tr-btn-fresh:hover, #tea-ritual-wrapper .tr-mood-btn.tr-btn-fresh.active { background: #fef3c7; border-color: #d97706; }



/* Rich (Black Tea) - Rose/Red (UPDATED from Mint) */

#tea-ritual-wrapper .tr-mood-btn.tr-btn-rich { background: #fff1f2; border-color: #fecdd3; }

#tea-ritual-wrapper .tr-mood-btn.tr-btn-rich .tr-icon { color: #b91c1c; }

#tea-ritual-wrapper .tr-mood-btn.tr-btn-rich:hover, #tea-ritual-wrapper .tr-mood-btn.tr-btn-rich.active { background: #ffe4e6; border-color: #be123c; }



/* Mellow (Pu-erh) - Blue/Slate */

#tea-ritual-wrapper .tr-mood-btn.tr-btn-mellow { background: #f8fafc; border-color: #cbd5e1; }

#tea-ritual-wrapper .tr-mood-btn.tr-btn-mellow .tr-icon { color: #475569; }

#tea-ritual-wrapper .tr-mood-btn.tr-btn-mellow:hover, #tea-ritual-wrapper .tr-mood-btn.tr-btn-mellow.active { background: #f1f5f9; border-color: #475569; }



#tea-ritual-wrapper .tr-mood-btn.active { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }



#tea-ritual-wrapper .tr-mood-btn span { font-size: 2.1rem; letter-spacing: 0.1em; color: #78716c; }

#tea-ritual-wrapper .tr-mood-btn.active span { color: #1c1917; font-weight: 500; }



/* Result Card */

#tea-ritual-wrapper .tr-result-card {

  background: #fafaf9;

  border: 1px solid #f5f5f4;

  border-radius: 16px;

  padding: 60px 40px;

  text-align: center;

  position: relative;

  max-width: 1000px;

  margin: 0 auto;

  animation: trFadeUp 0.6s ease-out forwards;

  transition: background-color 0.4s ease; /* Smooth transition for color change */

}



/* Result Card Dynamic Backgrounds */

#tea-ritual-wrapper .tr-result-fresh { background-color: #fffbf0; border-color: #fce7b0; }

#tea-ritual-wrapper .tr-result-rich { background-color: #fff1f2; border-color: #fecdd3; }

#tea-ritual-wrapper .tr-result-mellow { background-color: #f0f9ff; border-color: #bae6fd; }



#tea-ritual-wrapper .tr-result-heart {

  position: absolute;

  top: -30px;

  left: 50%;

  transform: translateX(-50%);

  background: #fff;

  color: #e7e5e4;

  border-radius: 50%;

  padding: 8px;

  line-height: 0;

}



#tea-ritual-wrapper .tr-result-card h4 {

  font-size: 3.5rem;

  color: #1c1917;

  margin: 15px 0 30px 0;

  font-weight: 400;

}



#tea-ritual-wrapper .tr-result-card p {

  color: #44403c;

  font-size: 2.1rem;

  line-height: 1.8;

  margin-bottom: 35px;

  font-weight: 300;

}



/* Note Badge (Dynamic Colors for Visibility) */

#tea-ritual-wrapper .tr-note-badge {

  display: inline-block;

  background: #fff;

  border: 1px solid #e7e5e4;

  padding: 12px 30px;

  border-radius: 50px;

  transition: all 0.3s;

}



/* Specific styles for note badge inside colored cards */

#tea-ritual-wrapper .tr-result-fresh .tr-note-badge {

  background-color: #fde68a; /* Stronger Yellow */

  border-color: #d97706;

  color: #92400e;

}



#tea-ritual-wrapper .tr-result-rich .tr-note-badge {

  background-color: #fbcfe8; /* Stronger Pink */

  border-color: #be123c;

  color: #9f1239;

}



#tea-ritual-wrapper .tr-result-mellow .tr-note-badge {

  background-color: #e0f2fe; /* Stronger Blue */

  border-color: #0284c7;

  color: #0c4a6e;

}



#tea-ritual-wrapper .tr-note-badge span { font-size: 1.7rem; color: inherit; letter-spacing: 0.05em; font-family: sans-serif; font-weight: 500; }



/* Brewing Grid */

#tea-ritual-wrapper .tr-steps-grid {

  display: grid;

  grid-template-columns: 1fr;

  gap: 40px;

  max-width: 1200px;

  margin: 0 auto;

}



@media (min-width: 768px) {

  #tea-ritual-wrapper .tr-steps-grid { grid-template-columns: 1fr 1fr; }

}



#tea-ritual-wrapper .tr-step-item {

  display: flex;

  flex-direction: column;

  align-items: center;

  text-align: center;

  gap: 20px;

  padding: 40px 30px;

  border-radius: 16px;

  background: #fff;

  border: 1px solid #f0f0f0;

  transition: all 0.3s ease;

  height: 100%; /* Force equal height for flex items if container is flex/grid */

  justify-content: flex-start; /* Align content to top */

}



#tea-ritual-wrapper .tr-step-item:hover { 

  background: #fafaf9; 

  transform: translateY(-5px);

  box-shadow: 0 10px 20px rgba(0,0,0,0.05);

  border-color: #e7e5e4;

}



#tea-ritual-wrapper .tr-step-row-header {

  display: flex;

  flex-direction: row;

  align-items: center;

  justify-content: center;

  gap: 15px;

  margin-bottom: 10px;

}



#tea-ritual-wrapper .tr-step-icon {

  flex-shrink: 0;

  width: 80px; 

  height: 80px;

  border-radius: 50%;

  background: #f5f5f4;

  display: flex;

  align-items: center;

  justify-content: center;

  color: #a8a29e;

  transition: all 0.3s;

}



#tea-ritual-wrapper .tr-step-item:hover .tr-step-icon { background: #1c1917; color: #fff; }



#tea-ritual-wrapper .tr-step-row-header h4 {

  font-size: 2.3rem; 

  margin: 0;

  color: #292524;

  font-weight: 400;

  white-space: nowrap; 

}



#tea-ritual-wrapper .tr-step-row-header h4 span { 

  font-size: 1.7rem; 

  color: #d6d3d1; 

  font-family: sans-serif; 

  margin-right: 8px; 

}



#tea-ritual-wrapper .tr-step-desc { 

  margin: 0; 

  color: #57534e; 

  font-size: 2.0rem; 

  font-family: sans-serif; 

  font-weight: 300; 

  line-height: 1.7; 

  max-width: 90%; 

}



/* Detailed Params Grid */

#tea-ritual-wrapper .tr-divider { height: 1px; background: #e7e5e4; margin: 50px auto; width: 100%; max-width: 250px; }



#tea-ritual-wrapper .tr-params-grid {

  display: grid;

  grid-template-columns: 1fr;

  gap: 30px;

  max-width: 1200px;

  margin: 0 auto;

}



@media (min-width: 768px) {

  #tea-ritual-wrapper .tr-params-grid { grid-template-columns: repeat(3, 1fr); }

}



#tea-ritual-wrapper .tr-param-card {

  background: #fff; 

  border: 1px solid #e7e5e4;

  border-radius: 20px;

  padding: 40px 30px;

  display: flex;

  flex-direction: column;

  align-items: center;

  text-align: center;

  transition: all 0.3s ease;

  height: 100%; /* Force equal height */

}



#tea-ritual-wrapper .tr-card-golden { background-color: #fffbf0; border-color: #fce7b0; }

#tea-ritual-wrapper .tr-card-blacktea { background-color: #fff1f2; border-color: #fecdd3; }

#tea-ritual-wrapper .tr-card-coldbrew { background-color: #f0f9ff; border-color: #bae6fd; }



#tea-ritual-wrapper .tr-param-card:hover {

  transform: translateY(-5px);

  box-shadow: 0 10px 25px rgba(0,0,0,0.06);

}



#tea-ritual-wrapper .tr-param-icon-box {

  color: #a8a29e;

  margin-bottom: 20px;

  transition: color 0.3s;

}



#tea-ritual-wrapper .tr-param-card:hover .tr-param-icon-box { color: #1c1917; }



#tea-ritual-wrapper .tr-param-title {

  font-size: 2.4rem; /* Adjusted for larger contrast */
  color: #292524;
  margin: 0 0 10px 0;
  font-weight: 400;
  letter-spacing: 0.05em;
}

#tea-ritual-wrapper .tr-param-subtitle {
  font-size: 1.5rem; /* Adjusted for larger contrast */
  color: #78716c;
  margin: 0 0 25px 0;
  font-family: sans-serif;
  font-weight: 300;
}

#tea-ritual-wrapper .tr-param-content {
  width: 100%;
  border-top: 1px solid rgba(0,0,0,0.05); 
  padding-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1; /* Allow content to push note to bottom if needed, or maintain space */
}

#tea-ritual-wrapper .tr-param-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: sans-serif;
  flex-wrap: nowrap; 
}

#tea-ritual-wrapper .tr-param-label { 
  font-size: 1.7rem; 
  color: #a8a29e; 
  white-space: nowrap; 
  margin-right: 10px; 
}

#tea-ritual-wrapper .tr-param-val { font-size: 1.8rem; color: #57534e; font-weight: 500; }
#tea-ritual-wrapper .tr-param-val.highlight { color: #b91c1c; font-weight: 600; } 

#tea-ritual-wrapper .tr-param-note {
  margin-top: auto; /* Push to bottom if flex container */
  font-size: 1.8rem; 
  color: #57534e; 
  background: rgba(255,255,255,0.6); 
  padding: 15px 20px;
  border-radius: 12px;
  text-align: left;
  line-height: 1.6;
}

/* CTA */
#tea-ritual-wrapper .tr-cta { text-align: center; margin-top: 60px; }
#tea-ritual-wrapper .tr-cta p {
  margin: 0; 
  font-size: 1.6rem; 
  color: #a8a29e; 
  font-family: "Noto Serif TC", "Songti TC", serif; /* Serif for high-class feel */
  font-style: italic; /* Italic for natural feel */
  letter-spacing: 0.05em; 
}

#tea-ritual-wrapper .tr-footer { background: #f5f5f4; padding: 35px; text-align: center; }
#tea-ritual-wrapper .tr-footer p { margin: 0; font-size: 1.7rem; color: #a8a29e; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; font-family: sans-serif; }

/* Animations */
@keyframes trFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.tr-tab-content { animation: trFadeUp 0.5s ease-out; }

/* ★★★ MOBILE OPTIMIZATION (Updated) ★★★ */
@media (max-width: 768px) {
  /* 1. 釋放橫向空間 */
  #tea-ritual-wrapper { padding-left: 10px; padding-right: 10px; }
  #tea-ritual-wrapper .tr-content { padding-left: 15px; padding-right: 15px; padding-top: 30px; }
  
  /* 2. 手機版改回「1個一排」的單欄排列 */
  #tea-ritual-wrapper .tr-mood-grid {
    grid-template-columns: 1fr; /* 單欄 */
    gap: 15px; /* 適中距離 */
    margin-bottom: 30px;
    grid-auto-rows: auto;
  }
  
  /* ★ 沖泡儀式(慢下來的藝術): 改為 2格一排 (Updated here) ★ */
  #tea-ritual-wrapper .tr-steps-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 Columns */
    gap: 10px; /* Tight gap */
    grid-auto-rows: 1fr; /* Force equal height */
  }

  /* 3. 調整按鈕與卡片內距 */
  #tea-ritual-wrapper .tr-mood-btn {
    padding: 25px 15px;
    gap: 15px;
    height: auto;
    justify-content: center;
    flex-direction: row; 
  }
  
  /* 沖泡儀式卡片樣式調整 (適應2欄) */
  #tea-ritual-wrapper .tr-step-item {
    padding: 15px 10px; /* Reduced padding */
    gap: 10px;
    height: 100%;
    justify-content: flex-start;
  }

  /* 4. 圖示與文字大小微調 */
  #tea-ritual-wrapper .tr-step-icon { width: 50px; height: 50px; }
  #tea-ritual-wrapper .tr-step-icon svg { width: 24px; height: 24px; }
  #tea-ritual-wrapper .tr-mood-btn svg { width: 42px; height: 42px; }
  
  /* 步驟標題調整 (垂直排列比較省空間) */
  #tea-ritual-wrapper .tr-step-row-header { gap: 5px; flex-direction: column; margin-bottom: 5px; } 
  #tea-ritual-wrapper .tr-step-row-header h4 { font-size: 1.4rem; } 
  #tea-ritual-wrapper .tr-step-row-header h4 span { font-size: 1.0rem; display: block; margin-right: 0; margin-bottom: 2px; }
  
  #tea-ritual-wrapper .tr-step-desc { 
    font-size: 1.0rem; 
    line-height: 1.4; 
    max-width: 100%; 
    min-height: auto; 
    display: block;
    overflow: visible;
  }
  
  #tea-ritual-wrapper .tr-mood-btn span { font-size: 1.4rem; }

  /* 5. 標題與間距整體收緊 */
  #tea-ritual-wrapper .tr-header { padding: 40px 20px; }
  #tea-ritual-wrapper .tr-title { font-size: 3.0rem; margin-bottom: 15px; }
  #tea-ritual-wrapper .tr-subtitle { font-size: 1.1rem; line-height: 1.6; }
  
  #tea-ritual-wrapper .tr-section-header { margin-bottom: 30px; }
  #tea-ritual-wrapper .tr-section-header h3 { font-size: 1.8rem; margin-bottom: 5px; }
  #tea-ritual-wrapper .tr-section-header p { font-size: 1.0rem; }
  #tea-ritual-wrapper .tr-subtitle-text { font-size: 1.1em; }
  
  /* ★ 建議沖泡方式: 維持 1格一排 (Updated here) ★ */
  #tea-ritual-wrapper .tr-params-grid { gap: 15px; grid-template-columns: 1fr; grid-auto-rows: auto; }
  
  /* 冷泡卡片優化: 讓它在單欄中自動適應大小 (還原為自動寬度，填滿格子，與其他兩格一致) */
  #tea-ritual-wrapper .tr-params-grid .tr-param-card:last-child { 
    grid-column: 1; 
    width: auto; /* Revert fit-content to fill width */
    margin: 0;
  }
  
  #tea-ritual-wrapper .tr-param-card { padding: 30px 20px; height: auto; }
  #tea-ritual-wrapper .tr-param-title { font-size: 1.6rem; margin-bottom: 5px; } 
  #tea-ritual-wrapper .tr-param-subtitle { font-size: 1.0rem; margin-bottom: 15px; } 
  #tea-ritual-wrapper .tr-param-content { padding-top: 15px; gap: 12px; }
  #tea-ritual-wrapper .tr-param-label { font-size: 1.1rem; }
  #tea-ritual-wrapper .tr-param-val { font-size: 1.2rem; }
  #tea-ritual-wrapper .tr-param-note { font-size: 1.1rem; padding: 12px; margin-top: 15px; min-height: auto; }
  
  /* 7. Footer & Tab */
  #tea-ritual-wrapper .tr-tab-btn { padding: 20px 10px; font-size: 1.2rem; }
  #tea-ritual-wrapper .tr-divider { margin: 30px auto; }
  #tea-ritual-wrapper .tr-cta { margin-top: 30px; }
  #tea-ritual-wrapper .tr-cta p { font-size: 1.0rem; } 
  #tea-ritual-wrapper .tr-footer { padding: 20px; }
  #tea-ritual-wrapper .tr-footer p { font-size: 0.9rem; }
}

</style>
</div>

<!-- 選茶小貼士彈窗(JS 搬至 body;自訂類=不依賴被圍堵的 Tailwind) -->
<div id="btpo-tips-modal" class="btpo-modal-overlay" role="dialog" aria-modal="true" aria-label="選茶小貼士">
    <div class="btpo-modal">
        <button type="button" class="btpo-modal-close" data-action="close-tips" aria-label="關閉">✕</button>
        <div class="btpo-modal-icon" aria-hidden="true">🍃</div>
        <h3>選茶小貼士</h3>
        <p class="btpo-modal-body">🌸 <strong>清爽提神？</strong>選 <span style="color:#2F705C;">高山烏龍</span>，感受山林的冷冽。<br><br>🔥 <strong>暖胃舒壓？</strong>選 <span style="color:#b45309;">精焙茶系列</span>，溫潤不刺激。<br><br>🍰 <strong>甜蜜時光？</strong>選 <span style="color:#b91c1c;">高山紅茶</span>，自帶天然果蜜香。</p>
        <button type="button" class="btpo-modal-btn" data-action="close-tips">了解了，前往挑選</button>
    </div>
</div>

<script>
(function () {
    var wrap = document.getElementById('btpo-page');
    if (!wrap) return;
    wrap.classList.add('btpojs'); /* JS 保險閘門:沒跑到這行,reveal 內容照常顯示 */
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* lucide 圖示(CDN 延遲重試) */
    function renderIcons() { if (window.lucide && window.lucide.createIcons) { window.lucide.createIcons(); return true; } return false; }
    if (!renderIcons()) {
        var tries = 0;
        var timer = setInterval(function () { tries++; if (renderIcons() || tries > 30) clearInterval(timer); }, 200);
    }

    /* 進場顯示 */
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1 });
        wrap.querySelectorAll('.reveal-on-scroll').forEach(function (el) { obs.observe(el); });
    } else {
        wrap.querySelectorAll('.reveal-on-scroll').forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* Hero 捲動鈕 */
    var scrollBtn = wrap.querySelector('[data-action="scroll-products"]');
    if (scrollBtn) scrollBtn.addEventListener('click', function () {
        var t = document.getElementById('products');
        if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });

    /* 選茶小貼士彈窗(搬 body 避開祖先 transform 綁架 fixed) */
    var modal = document.getElementById('btpo-tips-modal');
    var lastFocus = null;
    if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);
    function openTips() {
        lastFocus = document.activeElement;
        modal.classList.add('active');
        var c = modal.querySelector('.btpo-modal-close');
        if (c) setTimeout(function () { c.focus(); }, 60);
    }
    function closeTips() { modal.classList.remove('active'); if (lastFocus) lastFocus.focus(); }
    var tipsBtn = wrap.querySelector('[data-action="open-tips"]');
    if (tipsBtn && modal) tipsBtn.addEventListener('click', openTips);
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.closest('[data-action="close-tips"]')) closeTips();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeTips();
        });
    }

    /* 茶・靜心時刻(原 window.TeaRitual+onclick,收進 IIFE 事件綁定) */
    var trData = {
        fresh: { tea: '梨山華崗茶 Hua Gang Tea', desc: '清冽的山氣與蘭花香，是喚醒思緒最溫柔的方式。', note: '適合搭配：清淡的早餐或晨讀時光。', url: 'https://www.besttea1.com/products/%E8%8F%AF%E5%B4%97%E8%8C%B6' },
        rich: { tea: '日月潭紅玉 Sun Moon Lake Ruby', desc: '自帶肉桂與薄荷的天然香氣，為午後的倦怠注入活力。', note: '適合搭配：一小塊黑巧克力或奶油餅乾。', url: 'https://www.besttea1.com/zh-hant/products/ruby-black-tea' },
        mellow: { tea: '木柵鐵觀音 Muzha Tieguanyin', desc: '溫潤醇厚的口感，不刺激腸胃，撫平一日的喧囂。', note: '適合搭配：冥想、書寫日記或睡前放鬆。', url: 'https://www.besttea1.com/products/muzha-tieguanyin' }
    };
    var ritual = document.getElementById('tea-ritual-wrapper');
    if (ritual) {
        ritual.querySelectorAll('[data-tr-tab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tab = btn.getAttribute('data-tr-tab');
                ritual.querySelectorAll('.tr-tab-content').forEach(function (el) { el.style.display = 'none'; });
                var sel = document.getElementById('tab-' + tab);
                if (sel) sel.style.display = 'block';
                ritual.querySelectorAll('.tr-tab-btn').forEach(function (el) { el.classList.remove('active'); });
                btn.classList.add('active');
            });
        });
        ritual.querySelectorAll('[data-tr-mood]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var key = btn.getAttribute('data-tr-mood');
                var d = trData[key];
                if (!d) return;
                document.getElementById('result-title').textContent = d.tea;
                document.getElementById('result-desc').textContent = d.desc;
                document.getElementById('result-note').textContent = d.note;
                var link = document.getElementById('tr-result-link');
                if (link) { link.setAttribute('href', d.url); link.style.display = 'inline-block'; }
                var card = document.getElementById('mood-result-container');
                card.style.display = 'block';
                card.classList.remove('tr-result-fresh', 'tr-result-rich', 'tr-result-mellow');
                card.classList.add('tr-result-' + key);
                if (!reduced) {
                    card.style.animation = 'none';
                    void card.offsetHeight;
                    card.style.animation = 'trFadeUp 0.6s ease-out forwards';
                }
                ritual.querySelectorAll('.tr-mood-btn').forEach(function (el) { el.classList.remove('active'); });
                btn.classList.add('active');
            });
        });
    }
})();
</script>
