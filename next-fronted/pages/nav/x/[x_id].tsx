import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import XCard from "@/components/ui/xcard";
import SubPageLayout from "@/layouts/subpage";

const DynamicPage = () => {
  const router = useRouter();
  const { x_id } = router.query;
  const [data, setData] = useState(null);

  const fetchData = async (_id: any) => {
    if (!_id) return;
    try {
      const url = `/api/x/?x_id=${_id}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      const twitters = jsonData as any;

      setData(twitters[0]);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    if (x_id) {
      fetchData(x_id);
    }
  }, [x_id]);

  return (
    <SubPageLayout pageTitle="详情页面">
      <div>
        <p>详情id：{x_id}</p>
        {data && <XCard item={data} />}
      </div>
    </SubPageLayout>
  );
};

export default DynamicPage;
