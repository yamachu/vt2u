# vt2u / こえからわかるくん

ブラウザ上で録音した音声から、声道の長さ（Vocal Tract Length、VTL）や声の高さ（Fundamental Frequency、F0）を推定し、話者の年齢や性別を推定するWebアプリケーションです。

## 使い方

1. [vt2uのWebアプリケーション](https://yamachu.github.io/vt2u)にアクセスします
2. マイクの使用を許可します
3. 「録音を開始」ボタンを押して、音声を録音します
4. 解析結果を楽しみましょう

## 注意

録音環境や話し方によっても結果は変動します。あくまでも、個人で楽しむ範囲でご利用ください。

## 参考文献

- LAMMERT, Adam C.; NARAYANAN, Shrikanth S. On short-time estimation of vocal tract length from formant frequencies. PloS one, 2015, 10.7: e0132193.
- GROLL, Matti D., et al. Formant-estimated vocal tract length and extrinsic laryngeal muscle activation during modulation of vocal effort in healthy speakers. Journal of Speech, Language, and Hearing Research, 2020, 63.5: 1395-1403.

## 技術的な詳細

- .NET10 + .NET WebAssembly + React + TypeScript で実装されています
    - vtlib ディレクトリでは、音声解析の WebAssembly モジュールを C# で実装しています
        - praat はGitサブモジュールとして `praat/` に含まれています
        - praat-wasm ディレクトリには、praat の WebAssembly ビルドスクリプトとラップのためのコードが含まれています
    - クライアント側は React + TypeScript で実装されています
        - 録音には Web Audio API を利用しています
- 音声解析には [Praat](https://www.fon.hum.uva.nl/praat/) を利用しています

## ライセンスとサードパーティ

このプロジェクトは Praat（GPLv3）を `praat/` サブモジュールとして利用しています。Praat のソースはサブモジュールに含まれ、WebAssembly をビルドするスクリプトは `praat-wasm/` にあります。GPLv3 の全文は `COPYING` にあります。

本リポジトリからブラウザ向けの WASM を配布する場合、Praat の対応ソース（使用した Praat の特定コミット/タグ と、`praat-wasm/` 内のビルドスクリプト）を入手可能にしてください。詳細は `THIRD_PARTY_LICENSES.md` を参照してください。

