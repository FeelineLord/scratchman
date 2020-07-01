export class Abstract {
  readonly app: PIXI.Application;
  readonly view: HTMLCanvasElement;
  readonly width: number;
  readonly height: number;
  public _state: any;

  constructor(
    app: PIXI.Application,
    width: number,
    height: number,
  ) {
    this.app = app;
    this.view = app.view;
    this.width = width;
    this.height = height;
  }

  protected setState = (newValues, callback?: () => void) => {
    const keys = Object.keys(newValues);

    for (const key of keys) {
      this.state[key] = newValues[key]
    }

    if (
      typeof callback !== 'undefined'
    ) {
      callback()
    }
  };

  protected getRandomInt = (min: number, max: number, without?: number[]): number => {
    let result = Math.floor(min + Math.random() * (max + 1 - min));

    if (
      without &&
      without.find(n => result === n)
    ) {
      return this.getRandomInt(min, max, without)
    } else {
      return result;
    }
  };

  protected mixArray = (array) => {
    let j ;
    let temp ;
    const mixedArr = [ ...array ];

    for (let i = mixedArr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random()*(i + 1));

      temp = mixedArr[j];
      mixedArr[j] = mixedArr[i];
      mixedArr[i] = temp;
    }

    return mixedArr;
  }

  protected getRandomColor = (): number => {
    return parseInt('0X' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase());
  };

  protected getCanvas = (w: number, h: number): HTMLCanvasElement => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    return canvas;
  };

  get state() {
    return this._state;
  };
}
