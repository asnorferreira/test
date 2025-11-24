import { z } from 'zod';

export const UserResponseDTO = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),    
});

export const UserListResponseDTO = z.array(UserResponseDTO);

export type UserResponse = z.infer<typeof UserResponseDTO>;