import React from "react";
import {Composition} from "remotion";
import {Episode} from "./Episode";
import {DATA} from "./data";
import {FPS} from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    {Object.keys(DATA).map((id) => {
      const d = DATA[id];
      return (
        <Composition
          key={id}
          id={id}
          component={Episode}
          defaultProps={{id}}
          durationInFrames={Math.round(d.dur * FPS)}
          fps={FPS}
          width={1080}
          height={1440}
        />
      );
    })}
  </>
);
