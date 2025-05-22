import { useRouter } from "next/router";
import { ReportComponent } from "./index";
import { getAllParamsFromURL } from "../../../../lib/cryptoUtils";

const ReportPage = () => {
  const router = useRouter();
  const { id, index } = router.query;
  const { key } = getAllParamsFromURL(router.asPath);

  const reportIndex = parseInt(index, 10);
  console.log({ key, reportIndex, id });
  return <ReportComponent threadId={id} reportIndex={reportIndex} key64={key} mode="form" />;
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default ReportPage;
