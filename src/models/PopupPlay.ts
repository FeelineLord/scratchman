import {Abstract} from './Abstract';

export class PopupPlay extends Abstract {
  public startPosition: number
  public finishPosition: number
  public currentPosition: number
  readonly background: PIXI.Sprite
  readonly questionIcon: PIXI.Sprite
  readonly coinIcon: PIXI.Sprite
  readonly button: PIXI.Sprite
  readonly helpText: string
  readonly buttonText: string
  readonly playCost: number
  public visible: boolean
  readonly container: PIXI.Container

  constructor(
    app,
    width,
    height,
    background: PIXI.Sprite,
    questionIcon: PIXI.Sprite,
    coinIcon: PIXI.Sprite,
    button: PIXI.Sprite,
    helpText: string,
    buttonText: string,
    playCost: number,
  ) {
    super(app, width, height);

    this.background = background;
    this.questionIcon = questionIcon;
    this.coinIcon = coinIcon;
    this.button = button;
    this.helpText = helpText;
    this.buttonText = buttonText;
    this.playCost = playCost;
    this.visible = true;
    this.container = new PIXI.Container();
    this.container.zIndex = 6;
    this.finishPosition = this.height - 390;
    this.startPosition = this.height;
    this.currentPosition = this.finishPosition;
  }

  public init = (callback: (container: PIXI.Container) => void): void => {
    this.container.width = this.width;
    this.container.height = 390;

    this.container.x = 0;
    this.container.y = this.currentPosition;

    this.background.width = this.width;
    this.background.height = 390;
    this.container.addChild(this.background);


    const helpTextStyles = new PIXI.TextStyle({
      fontFamily: 'DRAguSans-Black',
      fontSize: '72px',
      fill: '#FF8729'
    });

    const helpText = new PIXI.Text(this.helpText, helpTextStyles);

    helpText.x = 426;
    helpText.y = 60;
    this.container.addChild(helpText);

    this.questionIcon.x = 320;
    this.questionIcon.y = 64;
    this.container.addChild(this.questionIcon);

    const buttonContainer = new PIXI.Container();
    buttonContainer.x = 63;
    buttonContainer.y = 216 - 25;

    this.button.width = this.width - 63 * 2;
    this.button.x = 0;
    this.button.y = 0;

    const buttonTextStyles = new PIXI.TextStyle({
      fontFamily: 'DRAguSans-Black',
      fontSize: '72px',
      fill: '#FFFFFF'
    });

    const buttonText = new PIXI.Text(this.buttonText + ' ' + this.playCost, buttonTextStyles);
    buttonText.anchor.set(0.5);
    buttonText.x = this.width / 2 - 63 - 84 / 2;
    buttonText.y = (130 / 2) + 20;

    this.coinIcon.anchor.set(0.5);
    this.coinIcon.x = this.width / 2 + 84 + 24;
    this.coinIcon.y = 130 / 2 + 54 / 2;

    buttonContainer.addChild(this.button);
    buttonContainer.addChild(buttonText);
    buttonContainer.addChild(this.coinIcon);

    buttonContainer.interactive = true;
    buttonContainer.buttonMode = true;

    this.container.addChild(buttonContainer);

    callback(this.container);

    buttonContainer.on('pointerdown', () => {
      this.visible = false;
    });
  }

  private hide = (speed, callbackStart, callbackEnd) => {
    callbackStart();
    this.currentPosition += speed;
    this.container.y = this.currentPosition;

    if (
      this.currentPosition >= this.startPosition
    ) {
      this.currentPosition = this.startPosition;
      this.container.y = this.currentPosition;
      callbackEnd();
    }
  };

  private show = (speed, callback) => {
    this.currentPosition -= speed;
    this.container.y = this.currentPosition;

    if (
      this.currentPosition <= this.finishPosition
    ) {
      this.currentPosition = this.finishPosition;
      this.container.y = this.currentPosition;
      callback();
    }
  }

  public update = (speed, callbackStart, callbackShow, callbackHide) => {
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
      this.show(speed, callbackShow);
    } else {
      this.hide(speed, callbackStart, callbackHide);
    }
  };
}
