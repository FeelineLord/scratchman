import {Abstract} from './Abstract';
import { v4 as uuidv4 } from 'uuid';

interface CanvasInterface {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  id: string,
  points: CanvasPointsInterface[]
}

interface CanvasPointsInterface {
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number
}

export class Card extends Abstract {
  public container: PIXI.Container
  private readonly size: number
  private readonly cx: number
  private readonly cy: number
  private readonly scratchTexture: HTMLImageElement
  private readonly itemTextures
  private bonus: boolean;
  private readonly bgFrame?: PIXI.Sprite
  public scratched: boolean;
  public win: boolean;
  public happy: string;

  // @ts-ignore
  public currentScratch
  //@ts-ignore
  private currentTexture

  constructor(
    app,
    width,
    height,
    cx: number,
    cy: number,
    size: number,
    scratchTexture: HTMLImageElement,
    itemTextures,
    bonus: boolean,
    bgFrame?: PIXI.Sprite,
  ) {
    super(app, width, height);

    this.cx = cx;
    this.cy = cy;
    this.size = size;

    if (bgFrame) {
      this.bgFrame = bgFrame;
      this.bgFrame.zIndex = 1;
    }

    this.scratchTexture = scratchTexture;
    this.itemTextures = itemTextures;
    this.bonus = bonus;

    this.container = new PIXI.Container();
    this.container.zIndex = 3;
    this.scratched = false;
    this.win = false;
    this.happy = 'tent';
  }

  /* Здесь начинается алгоритм scratch. В качестве текстуры, которую можно "вытирать" я использую canvas. Это удобно,
  и будет достаточно проивзодительно, если избавиться от надобности постоянно обновления. На canvas определяются 9
  точек, получаем их из объекта imageData холста (RGB-цвет в точке по x, y). Далее, по мере разрушения холста пользователем,
  на каждое его движение будет проверяться состояние точек. Если imageData у 7 и более точек не совпадает с исходными,
  значениями холст считается стёртым и уничтожается, открывая нам предмет. */
  private makeUniqueCanvas = (sizeX, sizeY, image): CanvasInterface => {
    const canvas: HTMLCanvasElement = this.getCanvas(sizeX, sizeY);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(image, 0, 0, sizeX, sizeY);

    const points: CanvasPointsInterface[] = [];

    for (let i = 0; i < 25; i++) {
      let line = 1;
      if (i % 5 === 0 && i !== 0) {
        line += 1;
      }
      const factor = i % 5;

      let x = (sizeX / 6) * (factor + 1);
      let y = (sizeY / 6) * line;

      let data = ctx.getImageData(x, y, 1, 1).data;

      /* С помощью альфа-канала можно сделать действительно очень эффектный скретчинг.
      К примеру, мы ведём курсором (областью вокруг него) по карте. Область затрагивает, допустим, 50 точек. Если каждой
      точке уменьшать альфа-канал на значение, допустим от 80, до 200 (в зависимости от расстояния между точкой и курсором)
      - получим такой себе эффект стирания поверхности с разной силой нажатия. Если Вам будет интересно - сделаю :) Конечно,
      это всё в теории. Я не смотрел, как это будет выглядеть и насколько много забирать ресурсов. Возможно, не получится.
      В общем, пока что загружаем в массив из 9ти точек объект, который содержит данные о точке (координаты, цвет).
      альфа-канал оставил на случай, если вместо нашего изображения будет загружена картинка (png) с эффектами полупрозрачности.
      Если на png-картинке будут полностью прозрачные области по координатам точек, алгоритм сольётся :D Но зачем делать
      прозрачную текстуру, которую предполагается стирать?) */
      points.push({
        x: x,
        y: y,
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3]
      });
    }

    return {
      canvas,
      ctx,
      id: uuidv4(),
      points
    }
  };

  //Создание карточки при новой игре
  private create = (item) => {
    this.container.destroy();

    this.container = new PIXI.Container();
    this.container.zIndex = 3;
    this.container.width = this.size;
    this.container.height = this.size;
    this.container.x = this.cx;
    this.container.y = this.cy;

    if (
      this.bgFrame
    ) {
      this.container.addChild(this.bgFrame);
    }

    const spriteItem = PIXI.Sprite.from(this.itemTextures[item])

    spriteItem.zIndex = 2;
    spriteItem.anchor.set(0.5);
    this.bonus ? spriteItem.x = this.size / 2 : spriteItem.x = this.size / 2 - 22;
    this.bonus ? spriteItem.y = this.size / 2 : spriteItem.y = this.size / 2 - 22;
    this.container.addChild(spriteItem);

    const canvasSize = this.bonus ? this.size : this.size - 46;
    this.currentTexture = this.makeUniqueCanvas(canvasSize, canvasSize, this.scratchTexture);

    this.currentScratch = PIXI.Sprite.from(this.currentTexture.canvas);
    this.currentScratch.zIndex = 3;
    this.currentScratch.name = 'scratchSprite';

    this.container.addChild(this.currentScratch);
  };

  //Добавляем интерактивные события
  private setEvents = (item, happyLoot, setAnimation, scratchingAnimation, getPrize, endGame, checkStatus?, checkWin?) => {
    let pointerOnCard = false;

    this.container.interactive = true;

    this.container.on('pointerout', () => {
      if (
        this.scratched
      ) {
        return ;
      }
      scratchingAnimation(false);
      pointerOnCard = false;
    })
    this.container.on('pointerover', () => {
      if (
        this.scratched
      ) {
        return ;
      }
      scratchingAnimation(true);
      pointerOnCard = true;
    });
    this.container.on('pointermove', (e) => {
      if (
        !pointerOnCard ||
        this.scratched
      ) {
        return ;
      }

      if (
        checkStatus && checkWin
      ) {
        this.onScratch(e, item, setAnimation, happyLoot === item, getPrize, endGame, checkStatus, checkWin);
      } else {
        this.onScratch(e, item, setAnimation, happyLoot === item, getPrize, endGame);
      }
    });

    this.app.stage.addChild(this.container);
  };

  private onScratch = (e, item, setAnimation, luck, getPrize, endGame, checkStatus?, checkWin?) => {
    let pointerData = e.data.global;

    const x = pointerData.x - this.cx;
    const y = pointerData.y - this.cy;

    this.scratching(this.currentTexture.ctx, x, y);

    if (
      checkStatus && checkWin
    ) {
      this.updateStatus(item, setAnimation, luck, getPrize, endGame, checkStatus, checkWin);
    } else {
      this.updateStatus(item, setAnimation, luck, getPrize, endGame);
    }

    this.currentScratch.zIndex = 3;
  };

  /* Это вышло случайно. Просто первый эксперимент, который пришёл в голову. Наг*внокодил на партиклы)))
  Думаю, этот способ имеет право на существование. Но, само собой, нуждается в research и доработке. Иии.. Да, браузеры
  включают throttle. Работает только при включённых devtools на chrome. Партиклы действительно хорошо выглядели */
  private scratching = (ctx, x, y) => {
    /*for (let i = 0; i < 25; i++) {
      if (this.bonus) {
        ctx.clearRect(x + i, y + i, 4, 4)
      } else {
        ctx.clearRect(x + i, y + i, 3, 3)
      }
    }*/

    ctx.clearRect(x - 20, y - 20, 40, 40)
  };

  private updateStatus = (item, setAnimation, luck, getPrize, endGame, checkStatus?, checkWin?) => {
    this.currentTexture.points = this.currentTexture.points.filter(p => {
      let dotData = this.currentTexture.ctx.getImageData(p.x, p.y, 1, 1).data;

      return p.r === dotData[0] ||
        p.g === dotData[1] ||
        p.b === dotData[2] ||
        p.a === dotData[3]
    });

    if (
      this.currentTexture.points.length <= 12
    ) {
      this.currentTexture.ctx.clearRect(0, 0, this.size, this.size);
      this.scratched = true;

      if (
        this.bonus
      ) {
        if (
          this.happy === item
        ) {
          setAnimation('super_win');
          endGame(getPrize(true, true, item));
          return ;
        } else {
          setAnimation('happy_card');
          endGame(getPrize(false, true, item));
          return ;
        }
      }

      if (
        luck
      ) {
        this.win = true;

        if (
          checkWin()
        ) {
          setAnimation('super_win');
          endGame(getPrize(false, false, item));
          return ;
        }
      }

      if (
        checkStatus
      ) {
        checkStatus();
      }

      setAnimation(luck ? 'happy_card' : 'disappointed');
    }
  };

  //Инициация карточек. Функция из game lifecycle
  public init = () => {
    this.container.width = this.size;
    this.container.height = this.size;
    this.container.x = this.cx;
    this.container.y = this.cy;

    if (
      this.bgFrame
    ) {
      this.container.addChild(this.bgFrame);
    }

    const canvasSize = this.size > 323 ? this.size : this.size - 46;
    this.currentTexture = this.makeUniqueCanvas(canvasSize, canvasSize, this.scratchTexture);

    this.currentScratch = PIXI.Sprite.from(this.currentTexture.canvas);
    this.currentScratch.zIndex = 3;

    this.container.addChild(this.currentScratch);

    this.app.stage.addChild(this.container);
  };

  //Функция из game lifecycle. Можно и нужно декомпозировать (сделал), запускается один раз при каждом старте новой игры
  public run = (item, happyLoot, setAnimation, scratchingAnimation, getPrize, endGame, checkStatus?, checkWin?) => {
    this.scratched = this.bonus;
    this.win = false;
    this.happy = happyLoot;

    this.create(item);
    if (
      checkStatus && checkWin
    ) {
      this.setEvents(item, happyLoot, setAnimation, scratchingAnimation, getPrize, endGame, checkStatus, checkWin)
    } else {
      this.setEvents(item, happyLoot, setAnimation, scratchingAnimation, getPrize, endGame)
    }
  };
}
