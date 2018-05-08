# react-native-moneris

> A wrapper to access the Moneris API from react native.

## Acknowledgements

Thanks to Akshay Nair [@shaynair](https://github.com/shaynair) for publishing the initial version at https://github.com/shaynair/moneris-js.

## Information

We forked from https://github.com/shaynair/moneris-js and fixed some build issues for the particular version of React Native we were using for an internal project (0.46.3).

We are not maintaining this library, you are on your own. The React Native integration is not in the best shape possible and much love would be needed. Mainly, tests with up to date React Native version would be needed.

If the build process complains about `es2015` not being found, you are probably missing Babel es2015 preset that is defined in `.babelrc` file of the project. The package you are looking for is: babel-preset-es2015.
