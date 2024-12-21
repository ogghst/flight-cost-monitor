import { Inject } from '@nestjs/common'
import { LOGGER } from '../logging.constants.js'

export const InjectLogger = () => Inject(LOGGER)
