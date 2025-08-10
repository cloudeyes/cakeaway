import type { Meta, StoryObj } from '@storybook/react-vite'
import { Unstyled } from "@storybook/addon-docs/blocks";

import { Basic2DTiles } from './Basic2DTiles'

const meta: Meta<typeof Basic2DTiles> = {
  title: 'Phaser.js Learning/Basic 2D Tiles',
  component: Basic2DTiles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Basic2DTiles>

export const Default: Story = {
  name: '기본 2D 타일 시스템',
  parameters: {
    docs: {
      description: {
        story: '정사각형 타일로 구성된 기본 2D 그리드입니다. 마우스를 올리면 초록색으로, 클릭하면 빨간색으로 하이라이트됩니다.'
      }
    }
  },
  decorators: [
    (Story) => (
      <Unstyled>
        <Story />
      </Unstyled>
    )
  ]
}
