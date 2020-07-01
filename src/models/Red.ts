import {Abstract} from './Abstract';
import {animationData} from '../assets/assets';

export class Red extends Abstract {
  readonly data: any
  protected container: PIXI.Container
  public current;

  constructor (
    app: PIXI.Application,
    width: number,
    height: number,
    ) {
    super(app, width, height);

    this.container = new PIXI.Container();
    this.container.zIndex = 4;
    this.current = null;
    this._state = {
      loaded: false,
      status: ''
    }
  }

  //Предзагрузка для отображения анимации загрузки
  public preload = (callback: () => void): void => {
    const spineLoaderOptions = {
      metadata: {
        spineAtlasFile: animationData
      }
    };

    const load = (_loader, res, callback) => {
      this.setState({
        loaded: true
      });

      this.current = new PIXI.spine.Spine(res.red.spineData);
      this.current.skeleton.setToSetupPose();
      this.current.update(0);
      this.current.autoUpdate = false;

      this.container.addChild(this.current);

      this.app.stage.addChild(this.container);

      const localRect = this.current.getLocalBounds();
      this.current.position.set(-localRect.x, -localRect.y);

      this.container.position.set(
        30,
        this.container.height / 2.3
      )

      this.app.stage.sortableChildren = true;

      callback();
    };

    this.app.loader
      .add('red', 'red.json', spineLoaderOptions)
      .load((loader, resources) => {
        load(loader, resources, callback)
      });
  };

  //Здесь устанавливаем определённую анимацию, за исключением: iddle, worry, loading
  public setAnimation = (animationName: string): void => {
    if (
      animationName === this.state.status
    ) {
      return ;
    }
    this.setState({
      status: animationName
    });
    this.current.state.setAnimation(0, 'red_' + animationName + '_st');
    this.current.state.addAnimation(0, 'red_' + animationName + '_loop', false, 0);
    this.current.state.addAnimation(0, 'red_' + animationName + '_end', false, 0);
    this.current.state.addAnimation(0, 'red_idle_st', false, 0);
    this.current.state.addAnimation(0, 'red_idle_loop', true, 0);
    this.setState({
      status: 'idle'
    });
  };

  //Анимация worry
  public scratchingAnimation = (start: boolean) => {
    if (
      start
    ) {
      this.setState({
        status: 'worry'
      });
      this.current.state.setAnimation(0, 'red_worry_st');
      this.current.state.addAnimation(0, 'red_worry_loop', true, 0);
    } else {
      this.setState({
        status: 'idle'
      });
      this.current.state.setAnimation(0, 'red_idle_st');
      this.current.state.addAnimation(0, 'red_idle_loop', true, 0);
    }
  };

  //Анимация loading
  public loadingAnimation = (start: boolean) => {
    if (
      start
    ) {
      this.setState({
        status: 'loading_screen_animation'
      });
      this.current.state.setAnimation(0, 'red_loading_screen_animation_st', false);
      this.current.state.addAnimation(0, 'red_loading_screen_animation_loop', true, 0);
    } else {
      this.setState({
        status: 'idle'
      });
      this.current.state.setAnimation(0, 'red_idle_st', false);
      this.current.state.addAnimation(0, 'red_idle_loop', true, 0);
    }
  };
}
