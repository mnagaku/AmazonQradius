// グラディウス - メインゲームファイル

// ゲームの状態
const GAME_STATE = {
    START: 0,
    PLAYING: 1,
    GAME_OVER: 2
};

// ゲーム設定
const GAME_CONFIG = {
    width: 800,
    height: 600,
    fps: 60,
    scrollSpeed: 2,
    playerSpeed: 5,
    playerStartX: 100,
    playerStartY: 300,
    maxLives: 3,
    invincibilityTime: 2000, // ミリ秒
    maxOptions: 4,
    powerMeterSlots: ['speed-up', 'missile', 'double', 'laser', 'option', 'shield']
};

// ゲームクラス
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.accumulator = 0;
        this.state = GAME_STATE.START;
        
        this.score = 0;
        this.lives = GAME_CONFIG.maxLives;
        this.stage = 1;
        this.powerMeter = 0;
        this.selectedPower = -1;
        this.powerMeterPosition = -1; // パワーメーターの現在位置
        this.powerMeterTimer = 0;     // パワーメーター移動タイマー
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.playerBullets = [];
        this.powerUps = [];
        this.explosions = [];
        this.background = new Background(this);
        
        this.keys = {};
        
        this.setupEventListeners();
        this.updateUI();
        
        // ゲームループ開始
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    setupEventListeners() {
        // キーボード入力
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // ゲーム開始
            if (e.code === 'Enter' && this.state !== GAME_STATE.PLAYING) {
                this.startGame();
            }
            
            // パワーアップ選択
            if (e.code === 'Space' && this.state === GAME_STATE.PLAYING) {
                this.activatePowerUp();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
        this.lives = GAME_CONFIG.maxLives;
        this.stage = 1;
        this.powerMeter = 0;
        this.selectedPower = -1;
        this.powerMeterPosition = -1;
        this.powerMeterTimer = 0;
        
        this.player = new Player(this);
        this.enemies = [];
        this.bullets = [];
        this.playerBullets = [];
        this.powerUps = [];
        this.explosions = [];
        
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        
        this.updateUI();
        
        console.log("Game started!");
    }
    
    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('stage').textContent = this.stage;
        
        // パワーメーターの更新
        for (let i = 0; i < GAME_CONFIG.powerMeterSlots.length; i++) {
            const slot = document.getElementById(GAME_CONFIG.powerMeterSlots[i]);
            slot.classList.remove('active', 'selected');
            
            if (i === this.powerMeterPosition) {
                slot.classList.add('selected');
            }
        }
        
        // デバッグ情報をコンソールに出力
        if (this.player && this.powerMeter > 0) {
            console.log("UI Updated - Power Meter Active, Position:", this.powerMeterPosition);
        }
    }
    
    activatePowerUp() {
        if (this.powerMeter > 0 && this.powerMeterPosition >= 0) {
            // 現在選択されているパワーアップを適用
            const powerType = GAME_CONFIG.powerMeterSlots[this.powerMeterPosition];
            console.log("Activating power-up:", powerType);
            
            this.player.applyPowerUp(powerType);
            
            // パワーメーターをリセット
            this.powerMeter = 0;
            this.powerMeterPosition = -1;
            this.powerMeterTimer = 0;
            
            this.updateUI();
        } else {
            console.log("No power-ups available");
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    gameLoop(timestamp) {
        // デルタタイム計算
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // ゲーム更新
        if (this.state === GAME_STATE.PLAYING) {
            this.update(deltaTime);
        }
        
        // 描画
        this.render();
        
        // 次のフレーム
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
        // プレイヤー更新
        this.player.update(deltaTime);
        
        // 背景更新
        if (this.background) {
            this.background.update(deltaTime);
        }
        
        // 敵の更新
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(deltaTime);
            if (this.enemies[i].isDestroyed) {
                this.enemies.splice(i, 1);
            }
        }
        
        // 弾の更新
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(deltaTime);
            if (this.bullets[i].isDestroyed) {
                this.bullets.splice(i, 1);
            }
        }
        
        // プレイヤーの弾の更新
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            this.playerBullets[i].update(deltaTime);
            if (this.playerBullets[i].isDestroyed) {
                this.playerBullets.splice(i, 1);
            }
        }
        
        // パワーアップの更新
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update(deltaTime);
            if (this.powerUps[i].isDestroyed) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // 爆発エフェクトの更新
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(deltaTime);
            if (this.explosions[i].isDestroyed) {
                this.explosions.splice(i, 1);
            }
        }
        
        // 衝突判定
        this.checkCollisions();
        
        // 敵の生成（仮の実装）
        if (Math.random() < 0.02) {
            this.spawnEnemy();
        }
        
        // パワーアップの生成（仮の実装）
        if (Math.random() < 0.005) {
            this.spawnPowerUp();
        }
    }
    
    render() {
        // 画面クリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景描画
        if (this.background) {
            this.background.render(this.ctx);
        }
        
        // スタート画面
        if (this.state === GAME_STATE.START) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('AmazonQradius', this.canvas.width / 2, 200);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press ENTER to Start', this.canvas.width / 2, 250);
            
            return;
        }
        
        // ゲームオーバー画面（HTMLオーバーレイを使用するため、ここでは描画しない）
        if (this.state === GAME_STATE.GAME_OVER) {
            return;
        }
        
        // 敵の描画
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // 弾の描画
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        
        // プレイヤーの弾の描画
        this.playerBullets.forEach(bullet => bullet.render(this.ctx));
        
        // パワーアップの描画
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        
        // 爆発エフェクトの描画
        this.explosions.forEach(explosion => explosion.render(this.ctx));
        
        // プレイヤー描画
        if (this.player) {
            // オプションを先に描画（プレイヤーの後ろに表示）
            if (this.player.options && this.player.options.length > 0) {
                this.player.options.forEach(option => option.render(this.ctx));
            }
            
            // プレイヤー自身を描画
            this.player.render(this.ctx);
        }
        
        // デバッグ情報
        if (this.player) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Options: ${this.player.options.length}`, 10, 580);
            this.ctx.fillText(`Power Meter: ${this.powerMeter}`, 120, 580);
        }
    }
    
    checkCollisions() {
        if (!this.player) return;
        
        // プレイヤーと敵の衝突
        if (!this.player.isInvincible) {
            for (const enemy of this.enemies) {
                if (this.checkCollision(this.player, enemy)) {
                    this.playerHit();
                    break;
                }
            }
        }
        
        // プレイヤーと敵の弾の衝突
        if (!this.player.isInvincible) {
            for (const bullet of this.bullets) {
                if (this.checkCollision(this.player, bullet)) {
                    this.playerHit();
                    bullet.destroy();
                    break;
                }
            }
        }
        
        // プレイヤーの弾と敵の衝突
        for (const bullet of this.playerBullets) {
            for (const enemy of this.enemies) {
                if (this.checkCollision(bullet, enemy)) {
                    enemy.hit(bullet.damage);
                    bullet.destroy();
                    break;
                }
            }
        }
        
        // プレイヤーとパワーアップの衝突
        for (const powerUp of this.powerUps) {
            if (this.checkCollision(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                powerUp.destroy();
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
    
    playerHit() {
        this.lives--;
        this.updateUI();
        
        this.player.hit();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    collectPowerUp(powerUp) {
        // パワーアップの種類に応じた処理
        if (powerUp.type === 'red') {
            // パワーメーターを1つ右に進める
            this.powerMeterPosition = (this.powerMeterPosition + 1) % GAME_CONFIG.powerMeterSlots.length;
            if (this.powerMeter === 0) {
                this.powerMeter = 1; // パワーメーターを有効化
            }
            console.log("Power meter advanced to position:", this.powerMeterPosition);
            this.addScore(100);
        } else if (powerUp.type === 'blue') {
            // 画面内の敵を全滅
            this.enemies.forEach(enemy => enemy.destroy());
            console.log("Blue capsule: all enemies destroyed");
            this.addScore(1000);
        }
        
        this.updateUI();
    }
    
    spawnEnemy() {
        // 仮の敵生成
        const enemy = new Enemy(
            this,
            this.canvas.width + 50,
            Math.random() * (this.canvas.height - 50),
            30,
            30
        );
        this.enemies.push(enemy);
    }
    
    spawnPowerUp() {
        // 仮のパワーアップ生成
        const type = Math.random() < 0.8 ? 'red' : 'blue';
        const powerUp = new PowerUp(
            this,
            this.canvas.width + 30,
            Math.random() * (this.canvas.height - 30),
            type
        );
        this.powerUps.push(powerUp);
    }
}
// プレイヤークラス
class Player {
    constructor(game) {
        this.game = game;
        this.x = GAME_CONFIG.playerStartX;
        this.y = GAME_CONFIG.playerStartY;
        this.width = 30;
        this.height = 15;
        this.speed = GAME_CONFIG.playerSpeed;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.blinkTimer = 0;
        this.isVisible = true;
        
        // パワーアップ状態
        this.speedLevel = 0;
        this.hasMissile = false;
        this.hasDouble = false;
        this.hasLaser = false;
        this.options = [];
        this.hasShield = false;
        this.shieldHits = 0;
        
        // 射撃関連
        this.shootTimer = 0;
        this.shootDelay = 0.2; // 秒
    }
    
    update(deltaTime) {
        // 移動
        if (this.game.keys['ArrowUp']) {
            this.y -= this.speed + this.speedLevel;
        }
        if (this.game.keys['ArrowDown']) {
            this.y += this.speed + this.speedLevel;
        }
        if (this.game.keys['ArrowLeft']) {
            this.x -= this.speed + this.speedLevel;
        }
        if (this.game.keys['ArrowRight']) {
            this.x += this.speed + this.speedLevel;
        }
        
        // 画面内に収める
        this.x = Math.max(0, Math.min(this.game.canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(this.game.canvas.height - this.height, this.y));
        
        // 射撃
        this.shootTimer -= deltaTime;
        if (this.game.keys['KeyZ'] && this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = this.shootDelay;
        }
        
        // ミサイル発射
        if (this.game.keys['KeyX'] && this.hasMissile && this.shootTimer <= 0) {
            this.shootMissile();
            this.shootTimer = this.shootDelay * 1.5;
        }
        
        // 無敵時間の更新
        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime * 1000;
            
            // 点滅効果
            this.blinkTimer -= deltaTime;
            if (this.blinkTimer <= 0) {
                this.isVisible = !this.isVisible;
                this.blinkTimer = 0.1; // 点滅間隔
            }
            
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                this.isVisible = true;
            }
        }
        
        // オプションの更新
        for (let i = 0; i < this.options.length; i++) {
            this.options[i].update(deltaTime);
        }
    }
    
    render(ctx) {
        if (!this.isVisible) return;
        
        // プレイヤー描画
        ctx.fillStyle = '#00f';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 先端部分
        ctx.fillStyle = '#0ff';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width - 10, this.y);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height);
        ctx.fill();
        
        // シールド描画
        if (this.hasShield) {
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width, this.y + this.height / 2, 15, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();
        }
    }
    
    shoot() {
        // 通常ショット
        if (this.hasLaser) {
            // レーザー
            const laser = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y + this.height / 2 - 2,
                50,
                4,
                'laser'
            );
            this.game.playerBullets.push(laser);
        } else if (this.hasDouble) {
            // ダブルショット - 1つは前方、1つは上方45度
            const bullet1 = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y + this.height / 2 - 2,
                10,
                4,
                'normal'
            );
            const bullet2 = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y,
                10,
                4,
                'diagonal'
            );
            this.game.playerBullets.push(bullet1, bullet2);
        } else {
            // 通常ショット
            const bullet = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y + this.height / 2 - 2,
                10,
                4,
                'normal'
            );
            this.game.playerBullets.push(bullet);
        }
        
        // オプションからも発射
        for (const option of this.options) {
            option.shoot();
        }
    }
    
    shootMissile() {
        if (!this.hasMissile) return;
        
        const missile = new PlayerBullet(
            this.game,
            this.x + this.width / 2,
            this.y + this.height,
            8,
            8,
            'missile'
        );
        this.game.playerBullets.push(missile);
        
        // オプションからも発射
        for (const option of this.options) {
            option.shootMissile();
        }
    }
    
    hit() {
        if (this.isInvincible) return;
        
        // シールドがある場合はシールドが吸収
        if (this.hasShield) {
            this.shieldHits++;
            if (this.shieldHits >= 2) {
                this.hasShield = false;
                this.shieldHits = 0;
            }
            return;
        }
        
        // 爆発エフェクト
        const explosion = new Explosion(this.game, this.x, this.y);
        this.game.explosions.push(explosion);
        
        // パワーアップをリセット
        this.speedLevel = 0;
        this.hasMissile = false;
        this.hasDouble = false;
        this.hasLaser = false;
        this.options = [];
        this.hasShield = false;
        
        // 無敵時間設定
        this.isInvincible = true;
        this.invincibilityTimer = GAME_CONFIG.invincibilityTime;
    }
    
    applyPowerUp(type) {
        console.log("Applying power-up:", type);
        
        switch (type) {
            case 'speed-up':
                if (this.speedLevel < 5) {
                    this.speedLevel++;
                    console.log("Speed level increased to:", this.speedLevel);
                }
                break;
            case 'missile':
                this.hasMissile = true;
                console.log("Missile activated");
                break;
            case 'double':
                this.hasDouble = true;
                this.hasLaser = false; // ダブルとレーザーは排他
                console.log("Double shot activated");
                break;
            case 'laser':
                this.hasLaser = true;
                this.hasDouble = false; // レーザーとダブルは排他
                console.log("Laser activated");
                break;
            case 'option':
                if (this.options.length < GAME_CONFIG.maxOptions) {
                    // 新しいオプションを追加
                    const option = new Option(
                        this.game, 
                        this, 
                        this.options.length > 0 ? this.options[this.options.length - 1] : null
                    );
                    this.options.push(option);
                    console.log("Option added, total:", this.options.length);
                } else {
                    console.log("Maximum options reached:", this.options.length);
                }
                break;
            case 'shield':
                this.hasShield = true;
                this.shieldHits = 0;
                console.log("Shield activated");
                break;
        }
    }
}

// オプションクラス
class Option {
    constructor(game, player, previousOption = null) {
        this.game = game;
        this.player = player;
        this.previousOption = previousOption; // 前のオプション（追従対象）
        
        // 初期位置の設定
        if (previousOption) {
            // 前のオプションがある場合はその後ろに配置
            this.x = previousOption.x - 30;
            this.y = previousOption.y;
        } else {
            // 最初のオプションはプレイヤーの後ろに配置
            this.x = player.x - 30;
            this.y = player.y;
        }
        
        this.width = 15;
        this.height = 10;
        this.positionHistory = [];
        this.historyMaxLength = 30; // 履歴の長さ
        
        // 初期位置履歴を作成
        for (let i = 0; i < this.historyMaxLength; i++) {
            this.positionHistory.push({ x: this.x, y: this.y });
        }
        
        console.log("Option created at:", this.x, this.y, "following:", previousOption ? "another option" : "player");
    }
    
    update(deltaTime) {
        // 追従対象の決定
        const target = this.previousOption || this.player;
        
        // 追従対象の位置履歴を記録
        this.positionHistory.unshift({ x: target.x, y: target.y });
        if (this.positionHistory.length > this.historyMaxLength) {
            this.positionHistory.pop();
        }
        
        // 履歴に基づいて位置を更新
        const historyIndex = 10; // 一定の遅延で追従
        if (historyIndex < this.positionHistory.length) {
            this.x = this.positionHistory[historyIndex].x;
            this.y = this.positionHistory[historyIndex].y;
        }
    }
    
    render(ctx) {
        // オプションを目立つように描画
        ctx.fillStyle = '#0af';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 輪郭を追加して視認性を高める
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    shoot() {
        // プレイヤーの武器に合わせて発射
        if (this.player.hasLaser) {
            const laser = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y + this.height / 2 - 2,
                50,
                4,
                'laser'
            );
            this.game.playerBullets.push(laser);
        } else if (this.player.hasDouble) {
            // ダブルショット - 1つは前方、1つは上方45度
            const bullet1 = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y + this.height / 2 - 2,
                10,
                4,
                'normal'
            );
            const bullet2 = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y,
                10,
                4,
                'diagonal'
            );
            this.game.playerBullets.push(bullet1, bullet2);
        } else {
            const bullet = new PlayerBullet(
                this.game,
                this.x + this.width,
                this.y + this.height / 2 - 2,
                10,
                4,
                'normal'
            );
            this.game.playerBullets.push(bullet);
        }
    }
    
    shootMissile() {
        if (!this.player.hasMissile) return;
        
        const missile = new PlayerBullet(
            this.game,
            this.x + this.width / 2,
            this.y + this.height,
            8,
            8,
            'missile'
        );
        this.game.playerBullets.push(missile);
    }
}
// プレイヤーの弾クラス
class PlayerBullet {
    constructor(game, x, y, width, height, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.speed = 10;
        this.damage = 1;
        this.isDestroyed = false;
        
        // タイプに応じた設定
        if (type === 'laser') {
            this.damage = 2;
        } else if (type === 'missile') {
            this.speed = 8;
            this.damage = 3;
            this.ySpeed = 2; // 下方向への速度
        }
    }
    
    update(deltaTime) {
        if (this.isDestroyed) return;
        
        if (this.type === 'missile') {
            // ミサイルは斜め下に進む
            this.x += this.speed;
            this.y += this.ySpeed;
            
            // 地形に当たったら上に反射（仮の実装）
            if (this.y + this.height > this.game.canvas.height) {
                this.ySpeed = -this.ySpeed;
            }
        } else if (this.type === 'diagonal') {
            // 斜め上に進む弾（ダブルショット用）
            this.x += this.speed * 0.7; // x方向の速度を少し遅く
            this.y -= this.speed * 0.7; // y方向は上に進む
        } else {
            // 通常弾とレーザーは直進
            this.x += this.speed;
        }
        
        // 画面外に出たら削除
        if (this.x > this.game.canvas.width || this.y < 0) {
            this.destroy();
        }
    }
    
    render(ctx) {
        if (this.isDestroyed) return;
        
        if (this.type === 'laser') {
            // レーザー
            ctx.fillStyle = '#f0f';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'missile') {
            // ミサイル
            ctx.fillStyle = '#f80';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            // 通常弾
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    destroy() {
        this.isDestroyed = true;
    }
}

// 敵クラス
class Enemy {
    constructor(game, x, y, width, height) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 3;
        this.health = 1;
        this.isDestroyed = false;
        this.shootTimer = Math.random() * 3;
    }
    
    update(deltaTime) {
        if (this.isDestroyed) return;
        
        // 移動
        this.x -= this.speed;
        
        // 画面外に出たら削除
        if (this.x + this.width < 0) {
            this.destroy();
        }
        
        // 射撃
        this.shootTimer -= deltaTime;
        if (this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = 2 + Math.random() * 2;
        }
    }
    
    render(ctx) {
        if (this.isDestroyed) return;
        
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            // 爆発エフェクト
            const explosion = new Explosion(this.game, this.x, this.y);
            this.game.explosions.push(explosion);
            
            // スコア加算
            this.game.addScore(100);
            
            // パワーアップドロップ（確率）
            if (Math.random() < 0.3) {
                const powerUp = new PowerUp(
                    this.game,
                    this.x,
                    this.y,
                    Math.random() < 0.8 ? 'red' : 'blue'
                );
                this.game.powerUps.push(powerUp);
            }
            
            this.destroy();
        }
    }
    
    shoot() {
        const bullet = new EnemyBullet(
            this.game,
            this.x,
            this.y + this.height / 2,
            10,
            5
        );
        this.game.bullets.push(bullet);
    }
    
    destroy() {
        this.isDestroyed = true;
    }
}

// 敵の弾クラス
class EnemyBullet {
    constructor(game, x, y, width, height) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 5;
        this.isDestroyed = false;
    }
    
    update(deltaTime) {
        if (this.isDestroyed) return;
        
        // 移動
        this.x -= this.speed;
        
        // 画面外に出たら削除
        if (this.x + this.width < 0) {
            this.destroy();
        }
    }
    
    render(ctx) {
        if (this.isDestroyed) return;
        
        ctx.fillStyle = '#ff0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    destroy() {
        this.isDestroyed = true;
    }
}
// パワーアップクラス
class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'red' or 'blue'
        this.speed = 2;
        this.isDestroyed = false;
    }
    
    update(deltaTime) {
        if (this.isDestroyed) return;
        
        // 移動
        this.x -= this.speed;
        
        // 画面外に出たら削除
        if (this.x + this.width < 0) {
            this.destroy();
        }
    }
    
    render(ctx) {
        if (this.isDestroyed) return;
        
        ctx.fillStyle = this.type === 'red' ? '#f00' : '#00f';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    destroy() {
        this.isDestroyed = true;
    }
}

// 爆発エフェクトクラス
class Explosion {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = 30;
        this.growSpeed = 60;
        this.isDestroyed = false;
    }
    
    update(deltaTime) {
        if (this.isDestroyed) return;
        
        // 拡大
        this.radius += this.growSpeed * deltaTime;
        
        // 最大サイズに達したら削除
        if (this.radius >= this.maxRadius) {
            this.destroy();
        }
    }
    
    render(ctx) {
        if (this.isDestroyed) return;
        
        ctx.fillStyle = `rgba(255, 100, 0, ${1 - this.radius / this.maxRadius})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    destroy() {
        this.isDestroyed = true;
    }
}

// 背景クラス
class Background {
    constructor(game) {
        this.game = game;
        this.stars = [];
        this.generateStars();
    }
    
    generateStars() {
        // 星の生成
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.game.canvas.width,
                y: Math.random() * this.game.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }
    
    update(deltaTime) {
        // 星の移動
        for (const star of this.stars) {
            star.x -= star.speed;
            
            // 画面外に出たら反対側から再登場
            if (star.x < 0) {
                star.x = this.game.canvas.width;
                star.y = Math.random() * this.game.canvas.height;
            }
        }
    }
    
    render(ctx) {
        // 背景色
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // 星の描画
        ctx.fillStyle = '#fff';
        for (const star of this.stars) {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game...");
    const game = new Game();
});
