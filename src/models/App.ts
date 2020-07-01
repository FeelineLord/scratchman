import {Abstract} from './Abstract';
import {sprites, lootForRandom} from '../assets/assets';
import 'pixi-spine';

import {Red} from './Red';
import {PopupPlay} from './PopupPlay';
import {PopupWin} from './PopupWin';
import {Card} from './Card';

export class App extends Abstract {
  readonly sprites
  private red: Red | null
  private popupPlay: PopupPlay | null
  private popupWin: PopupWin | null
  private scratchFields
  private bonusField: any
  readonly shadow: PIXI.Graphics
  private winnerText: PIXI.Container

  constructor(
    app: PIXI.Application,
    width: number,
    height: number,
  ) {
    super(app, width, height);

    this.sprites = {
      items: {

      }
    };

    this.red = null;
    this.popupPlay = null;
    this.popupWin = null;
    this.scratchFields = [];
    this.bonusField = {};

    this.scratchFields.length = 6;
    this.scratchFields.fill({});

    this.winnerText = new PIXI.Container();

    this.shadow = new PIXI.Graphics();

    this.app.stage.sortableChildren = true;
  }

  /* Preload - предзагрузка всех игровых assets, кроме шрифтов. При наличии в игре музыки, видеовставок и работой с
   бэкендом, его количество кода автоматически увеличивается раз в 10)) Можно, и нужно декомпозировать. На данный момент
   он читается скверно, даже для меня, создателя. */
  private preload = (): void => {
    this.red = new Red(
      this.app,
      this.width,
      this.height
    );

    this.red.preload(() => {
      this.app.ticker.add(() => {
        if (
          this.red !== null
        ) {
          this.red.current.skeleton.setToSetupPose();
          this.red.current.update(0);
          this.red.current.autoUpdate = true;
        }
      });

      if (
        this.red !== null
      ) {
        this.red.loadingAnimation(true);
      }

      spritesLoad(0);
    });

    const spritesKeys = Object.keys(sprites);

    const spritesLoad = (index) => {
      if (
        index === spritesKeys.length
      ) {
        /* Я не знаю, стоило ли здесь хардкодить. Как подсказывает логика, изобрежний, которые я хочу использовать как
        HTMLImageElement - всего 2. И вероятность того, что они не прогрузятся к моментру прогрузки остальных assets,
        ну-у... Вы сами понимаете. Своими действиями я ставлю сознательное ограничение и при добавлении новых картинок
        в приложение - нужно будет править этот метод. Однако, безопасность и превентивные меры против возможности бага
        - штука важная Не хочу давать артефактам шансов. Поэтому так)) HARDCODED! */
        let counter = 0;

        //Не чистая функция)) Где "+ 1" - мы добавляем текстуру из поля bonus
        const imagesLoader = () => {
          counter++

          if (
            counter === this.scratchFields.length + 1
          ) {
            /*
            Запускаем инициацию приложения после:
            а: загрузки и создания всех PIXI-спрайтов
            б: загрузки всех изобрежний, которые планируется использовать как HTMLImageElement
            */
            this.init();
          }
        }

        this.scratchFields = this.scratchFields.map(el => {
          const img = new Image() as HTMLImageElement;
          img.src = el.scratchTexture;
          img.addEventListener('load', imagesLoader);
          return {
            ...el,
            scratchTexture: img
          }
        });

        const img = new Image();
        img.src = this.bonusField.scratchTexture;
        img.addEventListener('load', imagesLoader);

        this.bonusField.scratchTexture = img;

      } else {
        this.app.loader
          .add(spritesKeys[index], sprites[spritesKeys[index]])
          .load((_loader, resources) => {

            const makeSprite = (key: string) => {
              for (const s of Object.keys(lootForRandom)) {
                if (
                  s + 'Item' === key
                ) {
                  // @ts-ignore
                  this.sprites.items[s] = resources[spritesKeys[index]].texture
                } else {
                  // @ts-ignore
                  this.sprites[key] = PIXI.Sprite.from(resources[spritesKeys[index]].texture)
                }
              }
            };

            const saveScratchContainers = () => {
              this.scratchFields = this.scratchFields.map(f => {
                // @ts-ignore
                const backgroundTexture = resources[spritesKeys[index]].texture
                const container = new PIXI.Container();

                return {
                  ...f,
                  container,
                  backgroundTexture
                }
              });
            };

            const saveScratchFrames = (key) => {
              if (
                key === 'scratchFrameSmall'
              ) {
                this.scratchFields = this.scratchFields.map(f => {
                  const scratchTexture = sprites[spritesKeys[index]];
                  return {
                    ...f,
                    scratchTexture
                  }
                });
              } else {
                this.bonusField.scratchTexture = sprites[spritesKeys[index]];
              }
            };

            if (
              spritesKeys[index] !== 'itemFrame' &&
              spritesKeys[index] !== 'scratchFrameSmall' &&
              spritesKeys[index] !== 'scratchFrameBig'
            ) {
              // @ts-ignore
              makeSprite(spritesKeys[index]);
            } else if (
              spritesKeys[index] === 'itemFrame'
            ) {
              saveScratchContainers();
            } else {
              saveScratchFrames(spritesKeys[index])
            }

            spritesLoad(index + 1);
          })
      }
    };
  };

  //Здесь мы отрисовываем один раз все изображения, что не будут изменяться в процессе игры.
  private drawStaticSprites = (): void => {
    this.app.stage.addChild(this.sprites.background);

    this.sprites.bonusFrame.x = this.width - this.sprites.bonusFrame.width;
    this.sprites.bonusFrame.y = 141;
    this.app.stage.addChild(this.sprites.bonusFrame);

    this.sprites.textFrame.x = 30 + 23;
    this.sprites.textFrame.y = 1020 + 23;
    this.sprites.textFrame.width = this.width - (30 + 23) * 2;
    this.sprites.textFrame.height = 163 - 23 * 2;
    this.app.stage.addChild(this.sprites.textFrame);

    this.sprites.motivation.anchor.set(0.5);
    this.sprites.motivation.y = 109;
    this.sprites.motivation.x = this.width / 2;
    this.app.stage.addChild(this.sprites.motivation);
  };

  //Отрисовываем popups, один раз. Не будет запускаться заново во время game loop.
  private makePopups = (): void => {
    this.popupPlay = new PopupPlay(
      this.app,
      this.width,
      this.height,
      this.sprites.startFrame,
      this.sprites.question,
      this.sprites.coinSmall,
      this.sprites.button,
      'How To Play',
      'Play for',
      60
    );

    this.popupWin = new PopupWin(
      this.app,
      this.width,
      this.height,
      this.sprites.winFrame,
      this.sprites.coinBig,
      this.sprites.dollar,
      'You Win'
    );

    /* Вообще, можно было зайти дальше. Создать класс abstract Popup, внести в него нужные методы и наследоваться popups
    от него, с рассчётом на то, что в будущем могут добавиться новые. Делать этого я не стал, потому что увеличу и так
    не малое для такого задания кода. Каждая абстракция должна иметь приделы, и в моём понимании - это тот случай, когда
    действительно нужно сказать: "стоп! Всплывающих табличек будет всего две, не стоит устраивать overkill" */
    this.popupPlay.init(el => {
      this.app.stage.addChild(el)
    });

    this.popupWin.init(el => {
      this.app.stage.addChild(el)
    });
  };

  /* Генерируем scartch-поля, один раз. Не запускается повторно во время game loop */
  private makeFields = (): void => {
    let accumulatorX = 0;
    let accumulatorY = 0;

    this.scratchFields = this.scratchFields.map((f, i) => {
      const backgroundSprite = PIXI.Sprite.from(f.backgroundTexture);

      accumulatorX += 15 + 322;

      if (
        i % 3 === 0
      ) {
        accumulatorX = 0;
        if (
          i !== 0
        ) {
          accumulatorY += 15 + 319;
        }
      }

      const cx = 52 + 23 + accumulatorX;
      const cy = 1205 + 23 + accumulatorY;

      return new Card(
        this.app,
        this.width,
        this.height,
        cx,
        cy,
        323,
        f.scratchTexture,
        this.sprites.items,
        false,
        backgroundSprite,
      );
    });

    this.bonusField = new Card(
      this.app,
      this.width,
      this.height,
      this.width - 116 - 366,
      366,
      366,
      this.bonusField.scratchTexture,
      this.sprites.items,
      true
    );
  };

  /* :D Нравится мне это название. А вот сама концепция могла бы быть чуть лучше. Алгоритм очень прост, однако это и
  делает его слишком статичным. По сути, сразу после нажатия "Play", генерируются предметы в табличках. А хотелось бы,
  наверное, сделать некую динамику. Скажем, чтоб стирание предыдущей таблички влияло на следующую. Но это гораздо сложнее,
  требует долгих research и глубоких мыслей в сторону теории вероятности. Идея такая: пользователь начинает стирать табличку,
  и только после этого действия генерируется предмет в следующей табличке, за которую возьмётся пользователь (её расположение
  не важно) */
  public getDestiny = () => {
    const loot = {...lootForRandom};

    const keys = Object.keys(loot);

    for (const l of keys) {
      //Инициируем процент (из ста), что определённый элемент будет "счастливым"
     loot[l] = loot[l] * (100 / 30);
    }

    //Исключем 0. От 1, до 100. С точностью до двух знаков после запятой.
    const int = this.getRandomInt(100, 10000) / 100;

    /* Здесь получаем предмет, на основе случайно выпавшего числа. Если это будет от 1, до ~ процента выпадения костра,
    получаем костёр. От ~ процентра выпадения костра, до ~ процента выпадения лука - получаем лук. И так далее... */
    let sum = 0;
    for (const l of keys) {
      sum += loot[l];
      if (int <= sum) {
        return l;
      } else if (keys.indexOf(l) === keys.length - 1) {
        return keys[0];
      }
    }
  };

  /* получаем абстратную таблицу предметов, с 3мя и больше повторяющимися "счастливыми" предметами. Гм. Я бы вообще
  убрал подсказку о том, какой предмет на итерации game loop является "счастливым". Зачем это? Чтоб сказать пользователю:
  "тебе выпадет либо три ЭТИХ предмета, либо ничего". Имхо, так мы уменьшаем предвкушение пользователя о возможном выигрыше
  перед тем, как он начнёт стирать карты */
  private jackpot = (happyItem): string[] => {
    const keys = Object.keys(lootForRandom);
    const result: string[] = [];

    let int1 = this.getRandomInt(0, keys.length - 1, [keys.indexOf(happyItem)]);
    result.push(keys[int1]);
    let int2 = this.getRandomInt(0, keys.length - 1, [keys.indexOf(happyItem), int1]);
    result.push(keys[int2]);
    let int3 = this.getRandomInt(0, keys.length - 1, [keys.indexOf(happyItem), int1, int2]);
    result.push(keys[int3]);

    for (let i = 3; i < 6; i++) {
      result.push(happyItem);
    }

    /* Смешиваем поля. Алгоритм (можете посмотреть в абстракции) работает гораздо лучше более простых аналогов. Он более
    равномерный. Взял из одной статьи на хабре, он был там под C++. Очень хороший. Использую его не первый раз :) */
    return this.mixArray(result);
  };

  /* Получаем абстрактную таблицу предметов, с 2мя и менее совпадениями. Таблица несудьбы */
  private loose = (happyLoot): string[] => {
    const keys = Object.keys(lootForRandom);
    const result: string[] = [];

    let int1 = this.getRandomInt(0, keys.length - 1);
    result.push(keys[int1]);
    let int2 = this.getRandomInt(0, keys.length - 1);
    result.push(keys[int2]);
    let int3 = this.getRandomInt(0, keys.length - 1, [keys.indexOf(happyLoot)]);
    result.push(keys[int3]);
    let int4 = this.getRandomInt(0, keys.length - 1, [keys.indexOf(happyLoot)]);
    result.push(keys[int4]);
    let int5 = this.getRandomInt(0, keys.length - 1, [keys.indexOf(happyLoot)]);
    result.push(keys[int5]);
    let int6 = this.getRandomInt(0, keys.length -1, [keys.indexOf(happyLoot)]);
    result.push(keys[int6]);

    return this.mixArray(result);
  };

  //Выводим на экран тест с призовым лутом
  private drawWinnerText = (item): void => {
    this.winnerText.destroy();
    this.winnerText = new PIXI.Container();
    this.winnerText.x = 90;
    this.winnerText.y = 1074;
    this.winnerText.width = this.width - 90 * 2;
    this.winnerText.height = 56;

    const textStyles = new PIXI.TextStyle({
      fontFamily: 'DRAguSans-Black',
      fontSize: '52px',
      fill: '#F45B4E'
    });

    const firstText = new PIXI.Text('MATCH THE WINNER', textStyles);
    const secondText = new PIXI.Text('AND WIN A PRIZE', textStyles);

    secondText.x = 631 - 85;

    const sprite = PIXI.Sprite.from(this.sprites.items[item]);
    sprite.width = 56;
    sprite.height = 56;
    sprite.x = 533 - 65;

    this.winnerText.addChild(firstText);
    this.winnerText.addChild(sprite);
    this.winnerText.addChild(secondText);

    this.app.stage.addChild(this.winnerText);
  };

  //проверяем, выпала ли нам удачная комбинация
  private checkWin = (): boolean => {
    let amount = 0;

    for (const s of this.scratchFields) {
      if (
        s.win
      ) {
        amount += 1;
      }

      if (
        amount === 3
      ) {
        return true;
      }
    }

    return false;
  };

  private getPrize = (luckyItem, bonus, item): any => {
    const prize = {
      type: 'coins',
      amount: 25
    };

    if (
      bonus
    ) {
      if (
        luckyItem
      ) {
        prize.type = 'dollar';
        prize.amount = 1;
      } else {
        prize.type = 'coins';
        prize.amount = 25;
      }
    } else {
      switch (item) {
        case 'bonfire':
          prize.type = 'coins';
          prize.amount = 25;
          break

        case 'bow':
          prize.type = 'coins';
          prize.amount = 30;
          break;

        case 'leaf':
          prize.type = 'coins';
          prize.amount = 35;
          break;

        case 'rope':
          prize.type = 'coins';
          prize.amount = 50;
          break;

        case 'tent':
          prize.type = 'coins';
          prize.amount = 100;
          break;
      }
    }

    return prize;
  };

  /* проверяем, не стрёрли ли мы последнюю карточку. Если стёрли - открываем доступ к бонусному полю, где можно получить
  гарантированный приз */
  private checkStatus = (): void => {
    let amount = 0;

    for (const s of this.scratchFields) {
      if (
        s.scratched
      ) {
        amount += 1;
      }

      if (
        amount === 6
      ) {
        this.unlockBonus();
      }
    }
  };

  unlockBonus = () => {
    this.bonusField.scratched = false;

    this.bonusField.happy = this.scratchFields[0].happy;
  };

  //С помощью этой функции, мы запускаем игру в index.ts. Запускается единожды
  public start = (): void => {
    this.preload();
  };

  //Основная функция, которая отрисовывает статическую графику и назначает некоторые переменные. Запускается единожды.
  public init = (): void => {
    this.drawStaticSprites();
    this.makePopups();
    this.makeFields();
    this.app.stage.sortChildren();

    this.bonusField.init();
    for (const f of this.scratchFields) {
      f.init();
    }

    /*Тень была в assets, однако разве её нужно делать картинкой? Зачем перегружать? В идеале было бы и background-поля,
    и текст сделать средствами pixi graphics. Возможно я проведу рефакторинг, сделаю это и забуду стереть коммент.
    А возможно, пожалею времени. Это ведь не production-проект. Дело в том, что я полный noob в PIXI (пока что изучаю 2й день)
    и кроме кубических кривых Безье не знаю способов создания прямоугольника со скругленными углами. Можно разобраться, можно
    сделать и кубическими кривыми, но кроме этого есть ещё много работы над данным приложением */
    this.shadow.beginFill(0x000000, 0.4);
    this.shadow.drawRect(0, 0, this.width, this.height);
    this.shadow.zIndex = 5;
    this.app.stage.addChild(this.shadow);

    if (
      this.red
    ) {
      this.red.loadingAnimation(false);
    }

    this.update();
  };

  //Функция из game lifecycle, генерирует новые поля и перезапускает игровой цикл. Запускается многократно, reuse
  public newGame = (): void => {
    const keys = Object.keys(lootForRandom);
    const happyLoot = this.getDestiny();
    //А вот и 30% на выигрыш
    const grid = this.getRandomInt(1, 100) >= 71 ? this.jackpot(happyLoot) : this.loose(happyLoot);

    if (
      this.red
    ) {
      this.drawWinnerText(happyLoot);
    }

    if (
      this.red
    ) {
      this.bonusField.run(
        keys[this.getRandomInt(0, 4)],
        this.scratchFields[0].happy,
        this.red.setAnimation,
        this.red.scratchingAnimation,
        this.getPrize,
        this.endGame
      );
    }

    this.scratchFields.forEach((f, i) => {
      if (
        this.red
      ) {
        f.run(
          grid[i],
          happyLoot,
          this.red.setAnimation,
          this.red.scratchingAnimation,
          this.getPrize,
          this.endGame,
          this.checkStatus,
          this.checkWin
        );
      }
    });
  };

  public endGame = (prize): void => {
    if (
      this.popupWin && this.popupPlay
    ) {
      this.popupPlay.visible = true;
      this.popupWin.drawPrize(prize);
    }
  };

  //Обновляет game lifecycle
  private update = (): void => {
    this.app.ticker.add(() => {
      if (
        this.scratchFields[1].currentScratch
      ) {
        for (const s of this.scratchFields) {
          s.currentScratch.texture.update();
        }
      }

      if (
        this.bonusField.currentScratch
      ) {
        this.bonusField.currentScratch.texture.update();
      }

      if (
        this.popupPlay !== null
      ) {
        this.popupPlay.update(
          15,
          () => {
            if (
              this.popupWin
            ) {
              this.popupWin.visible = false;
            }
          }, () => {
            this.shadow.visible = true;
          }, () => {
            this.shadow.visible = false;
            this.newGame();
          });
      }

      if (
        this.popupWin
      ) {
        this.popupWin.update(15);
      }
    });
  };
}

