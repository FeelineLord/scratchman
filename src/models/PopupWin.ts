import {Abstract} from './Abstract';

export class PopupWin extends Abstract {
  public startPosition: number
  public finishPosition: number
  public currentPosition: number
  readonly background: PIXI.Sprite
  readonly coinIcon: PIXI.Sprite
  readonly dollarIcon: PIXI.Sprite
  readonly winText: string
  public winAmount: number
  public visible: boolean
  readonly container: PIXI.Container
  prize: PIXI.Container;

  constructor(
    app,
    width,
    height,
    background: PIXI.Sprite,
    coinIcon: PIXI.Sprite,
    dollarIcon: PIXI.Sprite,
    winText: string,
  ) {
    super(app, width, height);

    this.background = background;
    this.coinIcon = coinIcon;
    this.dollarIcon = dollarIcon;
    this.winText = winText;
    this.visible = false;
    this.winAmount = 0;
    this.container = new PIXI.Container();
    this.container.zIndex = 7;
    this.finishPosition = 220;
    this.startPosition = 0 - 334;
    this.currentPosition = this.startPosition;
    this.prize = new PIXI.Container();
  }

  public drawPrize = (prize): void => {
    this.prize.destroy();

    this.prize = new PIXI.Container;
    this.prize.y = 370 - 230;

    const amountTextStyle = new PIXI.TextStyle({
      fontFamily: 'DRAguSans-Black',
      fontSize: '126px',
      fill: '#311D1F'
    });
    const amountText = new PIXI.Text(prize.amount, amountTextStyle);
    amountText.x = prize.type === 'dollar' ? 495 + 16 : prize.amount === 100 ? 495 - 136 : 495 - 106

    this.dollarIcon.x = 495 - 60;
    this.dollarIcon.y = 26;

    prize.amount === 100 ? this.coinIcon.x = 495 + 82 : this.coinIcon.x = 495 + 32;
    this.coinIcon.y = 28;

    if (
      prize.type === 'dollar'
    ) {
      this.prize.addChild(amountText, this.dollarIcon);
    } else {
      this.prize.addChild(amountText, this.coinIcon);
    }

    this.container.addChild(this.prize);

    this.visible = true;
  };

  public init = (callback: (container: PIXI.Container) => void): void => {
    this.container.width = this.width - 44 * 2;
    this.container.height = 334;

    this.container.x = 44;
    this.container.y = this.currentPosition;

    this.background.width = this.width - 44 * 2;
    this.background.height = 334;
    this.container.addChild(this.background);


    const winTextStyles = new PIXI.TextStyle({
      fontFamily: 'DRAguSans-Black',
      fontSize: '116px',
      fill: '#F45B4E'
    });

    const winText = new PIXI.Text(this.winText.toUpperCase(), winTextStyles);

    winText.y = 34;
    winText.x = 337 - 44;
    this.container.addChild(winText);


    callback(this.container);
  }

  private hide = (speed) => {
    this.currentPosition -= speed;
    this.container.y = this.currentPosition;

    if (
      this.currentPosition <= this.startPosition
    ) {
      this.currentPosition = this.startPosition;
      this.container.y = this.currentPosition;
    }
  };

  private show = (speed) => {
    this.currentPosition += speed;
    this.container.y = this.currentPosition;

    if (
      this.currentPosition >= this.finishPosition
    ) {
      this.currentPosition = this.finishPosition;
      this.container.y = this.currentPosition;
    }
  }

  public update = (speed) => {
    if (
      this.visible &&
      this.currentPosition === this.finishPosition ||
      !this.visible &&
      this.currentPosition === this.startPosition
    ) {
      return ;
    }

    if (
      this.visible
    ) {
      this.show(speed);
    } else {
      this.hide(speed);
    }
  };
}
