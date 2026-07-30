// commands.ts

export interface MountCommand {
  type: "OPTIONS/MOUNT";
}

export type Command =
  | MountCommand;
