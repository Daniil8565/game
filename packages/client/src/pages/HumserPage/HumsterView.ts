import { Theme } from '@/theme/ThemeContext'
import { getRandomInt } from '../../ utils/math_function'
import emerald from '../../image/emerald.png'

interface HumsterModel {
  emerald_y: number
  emerald_x: number
  expectation: number
  dop_count: number
  counter: number
  width: number
  height: number
  per: number
  per_hour: number
  current_level: number
  current_meaning: number
  transitional_meaning: number
}

export class HumsterView {
  public animationFrameId: number | null = null
  private model: HumsterModel
  public theme: Theme
  private circle_x: number
  private circle_y: number
  private circle_size: number
  public humster_img: HTMLImageElement
  public emerald_img: HTMLImageElement
  private context: CanvasRenderingContext2D
  // Флаг для проверки загрузки emerald_img
  private isEmeraldLoaded: boolean = false
  // Флаг для управления перерисовкой
  private needsRedraw: boolean = true

  constructor(humster_model: HumsterModel, theme: Theme) {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.theme = theme
    console.log('this.theme!.humster', theme)
    if (!this.theme.humster) {
      throw new Error('Theme is missing humster image URL')
    }
    this.circle_x = humster_model.width / 2
    this.circle_y = humster_model.height / 2
    this.circle_size = Math.min(humster_model.width, humster_model.height - 100)
    this.model = humster_model
    this.humster_img = new Image()
    this.humster_img.src = this.theme.humster
    this.humster_img.onload = () => {
      console.log('Humster image loaded successfully')
      // this.drawCanvas() // Перерисовываем после загрузки
      this.needsRedraw = true
    }
    this.humster_img.onerror = () => {
      console.error('Failed to load humster image:', this.theme.humster)
    }

    this.emerald_img = new Image()
    this.emerald_img.src = emerald
    this.emerald_img.onload = () => {
      console.log('Emerald image loaded successfully')
      this.isEmeraldLoaded = true
      // this.drawCanvas() // Перерисовываем после загрузки
      this.needsRedraw = true
    }
    this.emerald_img.onerror = () => {
      console.error('Failed to load emerald image:', this.emerald_img.src)
      this.isEmeraldLoaded = false
    }

    console.log(this.humster_img)

    this.animation()
  }

  drawCanvas() {
    this.context.clearRect(0, 0, this.model.width, this.model.height)
    this.topMenu()
    this.drawCircle()
    this.context.drawImage(
      this.humster_img,
      this.circle_x - this.humster_img.width / 2,
      this.circle_y - this.humster_img.height / 2
    )
    this.bottomMenu()
  }

  topMenu() {
    // первый прямоугольник
    this.context.fillStyle = this.theme!.color.block
    this.context.fillRect(
      this.model.width * 0.055,
      20,
      this.model.width * 0.25,
      50
    )
    this.context.font = '14px Arial'
    this.context.fillStyle = '#F79841'
    const center_rectangle1 = this.model.width * 0.055 + this.model.width * 0.12
    this.context.fillText('Монет за клик', center_rectangle1 - 45, 40)

    this.context.fillStyle = this.theme!.color.text
    this.context.fillText(`+${this.model.per}`, center_rectangle1, 60)
    this.drawDolar(center_rectangle1, 60, 12)

    // второй прямоугольник
    this.context.fillStyle = this.theme!.color.block
    this.context.fillRect(
      this.model.width * 0.355,
      20,
      this.model.width * 0.25,
      50
    )
    this.context.font = '14px Arial'
    this.context.fillStyle = '#6F72E2'
    const center_rectangle2 = this.model.width * 0.355 + this.model.width * 0.12
    this.context.fillText(
      `До ${this.model.current_level + 1} уровня`,
      center_rectangle2 - 35,
      40
    )
    this.context.fillStyle = this.theme!.color.text
    const coins_left =
      this.model.transitional_meaning -
      this.model.current_meaning -
      this.model.counter
    this.context.fillText(`${coins_left}`, center_rectangle2 - 10, 60)

    // третий прямоугольник
    this.context.fillStyle = this.theme!.color.block
    this.context.fillRect(
      this.model.width * 0.655,
      20,
      this.model.width * 0.25,
      50
    )

    this.context.font = '14px Arial'
    this.context.fillStyle = '#84CB69'
    const center_rectangle3 = this.model.width * 0.655 + this.model.width * 0.12
    this.context.fillText('Доход в час', center_rectangle3 - 35, 40)

    this.context.fillStyle = this.theme!.color.text
    this.context.fillText(`+${this.model.per_hour}`, center_rectangle3, 60)
    this.drawDolar(center_rectangle3, 60, 12)

    // посчет заработанных за раунд монет
    this.context.font = '50px Arial'
    this.context.fillStyle = this.theme!.color.text
    const counter_length = (this.model.counter + '').length * 10
    this.context.fillText(
      this.model.counter.toString(),
      this.model.width / 2 - counter_length,
      130
    )
    this.drawDolar(this.model.width / 2 - counter_length, 130, 30)
  }

  drawDolar(x: number, y: number, diameter: number) {
    this.context.beginPath()
    this.context.fillStyle = '#f9e160'
    this.context.arc(x - diameter, y - diameter / 2, diameter * 0.7, 0, 360)
    this.context.closePath()
    this.context.fill()

    this.context.beginPath()
    const radial_gradient = this.context.createRadialGradient(
      x - diameter,
      y - diameter / 2,
      0,
      x - diameter,
      y - diameter / 2,
      diameter / 2
    )
    radial_gradient.addColorStop(0.5, '#fec51c')
    radial_gradient.addColorStop(1, '#fe891ca5')
    this.context.fillStyle = radial_gradient
    this.context.arc(x - diameter, y - diameter / 2, diameter / 2, 0, 360)
    this.context.closePath()
    this.context.fill()

    this.context.font = `${diameter * 0.8}px Arial`
    this.context.fillStyle = this.theme!.color.text
    this.context.fillText('$', x - diameter * 1.2, y - diameter / 4)
  }

  drawEmerald() {
    if (
      this.isEmeraldLoaded &&
      this.emerald_img.complete &&
      this.emerald_img.naturalWidth !== 0
    ) {
      this.context.drawImage(
        this.emerald_img,
        this.model.emerald_x,
        this.model.emerald_y
      )
    } else {
      console.warn('Emerald image is not loaded yet or is broken')
    }
  }

  drawCircle() {
    // большой (внешний) круг
    this.context.beginPath()
    const large_circle_size =
      this.model.height > this.model.width
        ? this.circle_size * 0.4
        : this.circle_size * 0.3
    const gradient = this.context.createLinearGradient(
      0,
      this.circle_y - large_circle_size,
      0,
      this.circle_y + large_circle_size
    )
    gradient.addColorStop(0.2, this.theme!.color.large_circle_top)
    gradient.addColorStop(1, this.theme!.color.large_circle_bottom)
    this.context.fillStyle = gradient
    this.context.arc(this.circle_x, this.circle_y, large_circle_size, 0, 360)
    this.context.closePath()
    this.context.fill()
    // маленький (внутренний) круг
    this.context.beginPath()
    const small_circle_size =
      this.model.height > this.model.width
        ? this.circle_size * 0.35
        : this.circle_size * 0.25
    const radial_gradient = this.context.createRadialGradient(
      this.circle_x,
      this.circle_y,
      0,
      this.circle_x,
      this.circle_y,
      small_circle_size
    )
    radial_gradient.addColorStop(0.6, this.theme!.color.small_circle_top)
    radial_gradient.addColorStop(1, this.theme!.color.small_circle_bottom)
    this.context.fillStyle = radial_gradient
    this.context.arc(this.circle_x, this.circle_y, small_circle_size, 0, 360)
    this.context.closePath()
    this.context.fill()
  }

  bottomMenu() {
    this.context.font = '14px Arial'
    this.context.fillStyle = '#f7c243'
    this.context.fillText('⚡️', 40, this.model.height - 40)

    this.context.fillStyle = this.theme!.color.text
    this.context.fillText(
      `${this.model.current_meaning + this.model.counter} / ${
        this.model.transitional_meaning
      }`,
      60,
      this.model.height - 40
    )
    this.context.fillText(
      `${this.model.current_level} уровень`,
      this.model.width - 110,
      this.model.height - 40
    )
  }

  animation = () => {
    this.animationFrameId = window.requestAnimationFrame(this.animation)
    // отсчет задержки между падением изумрудов
    if (this.model.expectation > 0) {
      this.model.expectation--
      this.needsRedraw = true
      return
    }
    // уничтожение изумруда при достижении низа экрана
    // или ичерпании дополнительных баллов;
    if (
      this.model.height === this.model.emerald_y ||
      this.model.dop_count === 0
    ) {
      this.drawCanvas()
      this.model.emerald_x = 0
      this.model.emerald_y = 0
      this.model.dop_count = 50
      this.model.expectation = getRandomInt(50) * 100
      this.needsRedraw = true
    }
    // перересовка конваса
    else this.redraw()
    // Перерисовываем только если есть изменения
    if (this.needsRedraw) {
      this.drawCanvas()
      this.drawEmerald()
      this.needsRedraw = false
    }
  }

  redraw() {
    // расчет координаты х изумруда при начале падения
    if (this.model.emerald_x === 0 && this.model.emerald_y === 0) {
      this.model.emerald_x = getRandomInt(this.model.width - 100)
      this.needsRedraw = true
    }
    this.model.emerald_y = this.model.emerald_y + 1
    // this.drawCanvas()
    // this.drawEmerald()
    this.needsRedraw = true
  }
}
