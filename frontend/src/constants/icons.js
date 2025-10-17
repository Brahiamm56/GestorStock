import { h, defineComponent } from 'vue'
import { Message, Phone, User, Location, InfoFilled, Clock } from '@element-plus/icons-vue'

export const ICONS = {
  email: Message,
  phone: Phone,
  role: User,
  address: Location,
  status: InfoFilled,
  login: Clock
}

export const Icon = defineComponent({
  name: 'AppIcon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: 20 },
    color: { type: String, default: undefined }
  },
  setup(props) {
    return () => {
      const Comp = ICONS[props.name]
      if (!Comp) return null
      const style = {
        fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
        color: props.color
      }
      return h(Comp, { style })
    }
  }
})