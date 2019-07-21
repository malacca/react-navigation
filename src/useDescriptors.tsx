import * as React from 'react';
import {
  Descriptor,
  PartialState,
  NavigationAction,
  NavigationProp,
  NavigationState,
  ParamListBase,
  RouteConfig,
} from './types';
import SceneView from './SceneView';
import NavigationBuilderContext, {
  ChildActionListener,
} from './NavigationBuilderContext';

type Options = {
  state: NavigationState | PartialState;
  screens: { [key: string]: RouteConfig<ParamListBase, string> };
  navigation: NavigationProp<ParamListBase>;
  onAction: (action: NavigationAction, sourceNavigatorKey?: string) => boolean;
  getState: () => NavigationState;
  setState: (state: NavigationState) => void;
  addActionListener: (listener: ChildActionListener) => void;
  removeActionListener: (listener: ChildActionListener) => void;
  onRouteFocus: (key: string) => void;
};

export default function useDescriptors<ScreenOptions extends object>({
  state,
  screens,
  navigation,
  onAction,
  getState,
  setState,
  addActionListener,
  removeActionListener,
  onRouteFocus,
}: Options) {
  const [options, setOptions] = React.useState<{ [key: string]: object }>({});
  const context = React.useMemo(
    () => ({
      navigation,
      onAction,
      addActionListener,
      removeActionListener,
      onRouteFocus,
    }),
    [
      navigation,
      onAction,
      onRouteFocus,
      addActionListener,
      removeActionListener,
    ]
  );

  return state.routes.reduce(
    (acc, route) => {
      const screen = screens[route.name];

      acc[route.key] = {
        render() {
          return (
            <NavigationBuilderContext.Provider value={context}>
              <SceneView
                navigation={navigation}
                route={route}
                screen={screen}
                getState={getState}
                setState={setState}
                setOptions={setOptions}
              />
            </NavigationBuilderContext.Provider>
          );
        },
        options: {
          ...(typeof screen.options === 'function'
            ? screen.options({
                // @ts-ignore
                route,
                navigation,
              })
            : screen.options),
          ...options[route.key],
        },
      };
      return acc;
    },
    {} as { [key: string]: Descriptor<ScreenOptions> }
  );
}