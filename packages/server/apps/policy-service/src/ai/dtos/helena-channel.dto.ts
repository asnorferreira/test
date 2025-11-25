import { ApiProperty } from '@nestjs/swagger';

export enum HelenaChannelType {
  All = 'All',
  Whatsapp = 'Whatsapp',
  Messenger = 'Messenger',
  Instagram = 'Instagram',
}

class HelenaChannelIdentityDto {
  @ApiProperty()
  humanId: string;
  @ApiProperty()
  platform: string;
  @ApiProperty()
  provider: string;
  @ApiProperty()
  providerVariable: string;
  @ApiProperty()
  pictureUrl: string;
  @ApiProperty()
  displayName: string;
}

export class HelenaChannelResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
  @ApiProperty()
  active: boolean;
  @ApiProperty()
  type: string;
  @ApiProperty({ nullable: true })
  number: string | null;
  @ApiProperty({ nullable: true })
  numberFormatted: string | null;
  @ApiProperty({ type: HelenaChannelIdentityDto })
  identity: HelenaChannelIdentityDto;
}