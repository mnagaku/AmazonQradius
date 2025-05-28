# AmazonQradius

[**👉 ここをクリックしてゲームをプレイ**](https://mnagaku.github.io/AmazonQradius/)

AmazonQradiusは、クラシックなシューティングゲーム「グラディウス」にインスパイアされた、JavaScriptで作られたブラウザゲームです。

## ゲーム概要

AmazonQradiusは横スクロールシューティングゲームで、プレイヤーは宇宙船を操作して敵を倒しながら進んでいきます。ゲームの特徴的な要素として、パワーアップシステムがあります。敵を倒すと赤いカプセルが出現し、それを取得するとパワーメーターが進みます。スペースキーを押すと、現在選択されているパワーアップが適用されます。

## 操作方法

- **矢印キー**: 自機の移動
- **Zキー**: ショット/レーザー発射
- **Xキー**: ミサイル発射（取得後）
- **スペースキー**: パワーアップ選択・適用
- **Enterキー**: ゲーム開始/リスタート

## パワーアップ一覧

1. **Speed-Up**: 自機の移動速度が上がります（最大5段階）
2. **Missile**: 斜め下方向にミサイルを発射できるようになります
3. **Double**: 前方と斜め上方向に2発同時発射します
4. **Laser**: 強力なレーザービームを発射します
5. **Option**: 自機の分身が追従します（最大4個）
6. **Shield**: 前面に2枚のシールドを展開します（2回のダメージを防ぐ）

## ゲームの特徴

- クラシックなシューティングゲーム体験
- 独自のパワーアップシステム
- 最大4つのオプション（分身）による攻撃力強化
- 様々な武器タイプ（通常ショット、ダブル、レーザー、ミサイル）

## 技術的な詳細

- 純粋なJavaScript、HTML5、CSSで実装
- Canvas APIを使用したグラフィック描画
- オブジェクト指向プログラミングによるゲーム設計
- 衝突判定、パーティクルエフェクトなどのゲームメカニクス

## ローカルでの実行方法

1. リポジトリをクローンまたはダウンロードします
2. `index.html`をウェブブラウザで開きます
3. Enterキーを押してゲームを開始します

## 開発背景

このゲームは、Amazon Q Developer CLIへのプロンプト指示のみで作成されました。開発者はコードを直接書くことなく、Amazon Q Developerに対する自然言語での指示だけでゲーム全体を実装しています。

また、ゲームの仕様を定義する際には、ChatGPTにまとめさせたグラディウスの詳細仕様を基にしています。これにより、オリジナルゲームの特徴を正確に再現することができました。

この開発手法は、AIアシスタントを活用したソフトウェア開発の可能性を示す一例となっています。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

```
MIT License

Copyright (c) 2025 AmazonQradius

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 謝辞

オリジナルの「グラディウス」を開発したコナミに敬意を表します。このプロジェクトは教育目的で作成されたファンメイド作品です。

## 開発者向け情報

ゲームは以下のファイルで構成されています：

- `index.html`: ゲームのHTMLマークアップ
- `style.css`: ゲームのスタイル定義
- `game.js`: ゲームのメインロジック
