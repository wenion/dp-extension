// commands.ts

export interface MountCommand {
  type: "APP/MOUNT";
}

export type Command =
  | MountCommand;
