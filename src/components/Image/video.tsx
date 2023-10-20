import React, { FC, memo, useState } from "react";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";

import { LayoutChangeEvent } from "react-native";
import { StoryVideoProps } from "../../core/dto/componentsDTO";
import Video from "react-native-video";
import { WIDTH } from "../../core/constants";

const StoryVideo: FC<StoryVideoProps> = ({
  uri,
  paused,
  onLoad,
  onLayout,
  ...props
}) => {
  try {
    const [pausedValue, setPausedValue] = useState(!paused.value);

    useAnimatedReaction(
      () => paused.value,
      (res, prev) => res !== prev && runOnJS(setPausedValue)(!res),
      [paused.value]
    );

    return (
      <Video
        style={{ width: WIDTH, aspectRatio: 0.5626 }}
        {...props}
        source={{ uri }}
        paused={!pausedValue}
        controls={false}
        repeat={false}
        onLoad={(_: any, duration: number) => onLoad(duration * 1000)}
        onLayout={(e: LayoutChangeEvent) =>
          onLayout(e.nativeEvent.layout.height)
        }
      />
    );
  } catch (error) {
    return null;
  }
};

export default memo(StoryVideo);
