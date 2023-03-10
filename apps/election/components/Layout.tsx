import { NextPage } from 'next';
import { FunctionComponent, Fragment, PropsWithChildren, useMemo } from 'react';
import clsxm from '../utils/clsxm';
import { SITE_NAME } from '../utils/env';
import Head from './Head';

export interface LayoutConfigProps {
  title: string;
  className?: string;
}

export type UnknownProps = Record<string, any>;

export const MainLayoutPage: FunctionComponent<PropsWithChildren<LayoutConfigProps>> = (props) => {
  const {
    children,
    className,
    title: titleProps
  } = props;

  const title = titleProps?.includes(SITE_NAME) ? titleProps : `${titleProps} | ${SITE_NAME}`;

  return (
    <Fragment>
      <Head title={title} />
      <div className={clsxm(['flex flex-col min-h-screen', className])}>
        {children}
      </div>
    </Fragment>
  );
};

/**
 * Higher-order component that wraps the provided component in a `<MainLayoutPage>` component.
 * Of course, you can create your new Layout with this template!
 * @param PageComponent - The page component to wrap with the layout
 * @param layoutProps - The props to pass to the layout
 * @returns - NextPage
 */
export const withMobileLayoutPage = <T extends UnknownProps>(
  PageComponent: NextPage<T>, layoutProps: LayoutConfigProps|((pageProps: T) => LayoutConfigProps)
) => {
  const LayoutPage: FunctionComponent<T> = (pageProps) => {
    const layoutPropsWithPageProps = useMemo(() => {
      return typeof layoutProps === 'function'
        ? layoutProps(pageProps) : layoutProps;
    }, [pageProps]);

    return (
      <MainLayoutPage {...layoutPropsWithPageProps}>
        <div
          className={clsxm([
            'relative max-w-[500px] mx-auto w-full flex flex-col min-h-screen shadow-xl'
          ])}
        >
          <div className="w-full bg-indigo-500 px-5 py-3 shadow-md">
            <h1 className="text-white text-center font-bold text-xl">
              {layoutPropsWithPageProps.title}
            </h1>
          </div>
          <PageComponent {...pageProps} />
        </div>
      </MainLayoutPage>
    );
  };
  return LayoutPage;
};

export default MainLayoutPage;
