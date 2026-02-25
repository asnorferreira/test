import { Entity } from "@/core/domain/Entity";
import { UserRole } from "@maemais/shared-types";

export interface UserProps {
  name: string;
  email: string;
  cpf?: string | null;
  phone?: string | null;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  static create(props: UserProps, id?: string): User {
    return new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  updatePhone(phone: string) {
    this.props.phone = phone;
    this.props.updatedAt = new Date();
  }
}
