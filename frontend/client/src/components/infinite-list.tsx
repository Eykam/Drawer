import { FixedSizeList as List } from "react-window";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import ListItem from "./list-item";
import { Checkbox } from "@mui/material";
import { File } from "@/store/fileStore";
import useTableHelpers from "@/lib/useTableHelpers";

const InfiniteList = ({
  FileList,
  selectAll,
}: {
  FileList: File[];
  selectAll: (add: boolean) => void;
}) => {
  const rows = ({
    data,
    index,
    style,
  }: {
    data: { files: File[] };
    index: number;
    style: React.CSSProperties;
  }) => {
    return (
      <div style={style}>
        <ListItem data={data} index={index} />
      </div>
    );
  };

  const tableHelpers = useTableHelpers();

  return (
    <div>
      <div
        style={{
          width: "100%",
          display: "flex",
          textAlign: "center",
          justifyContent: "space-between",
          background: "rgb(150,150,150)",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "45%",
          }}
        >
          <Checkbox
            sx={{
              alignItems: "center",
              margin: "auto 0",
            }}
            size="small"
            style={{
              padding: "0",
              display: "inline-block",
              margin: "auto 0",
            }}
            onClick={(e) => {
              const checked = (e.target as HTMLInputElement).checked;

              if (checked) selectAll(true);
              else selectAll(false);
            }}
          />

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
            onClick={() => {
              tableHelpers.setNameAscending(!tableHelpers.nameAscending);
              tableHelpers.sortByName();
            }}
          >
            <h5
              style={{
                padding: "0",
                margin: "0",
                marginLeft: "1vw",
              }}
            >
              Name:
            </h5>

            {tableHelpers.nameAscending ? (
              <NorthIcon
                style={{
                  fontSize: "90%",
                  alignSelf: "center",
                  margin: "0",
                  padding: "0",
                }}
              />
            ) : (
              <SouthIcon
                style={{
                  fontSize: "90%",
                  alignSelf: "center",
                  margin: "0",
                  padding: "0",
                }}
              />
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "15%",
            justifyContent: "space-between",
          }}
          onClick={() => {
            tableHelpers.setDateAscending(!tableHelpers.dateAscending);
            tableHelpers.sortByDate();
          }}
        >
          <h5 style={{ padding: "0", margin: "0" }}>| Date:</h5>

          {tableHelpers.dateAscending ? (
            <NorthIcon
              style={{
                fontSize: "90%",
                alignSelf: "center",
                margin: "0",
                padding: "0",
              }}
            />
          ) : (
            <SouthIcon
              style={{
                fontSize: "90%",
                alignSelf: "center",
                margin: "0",
                padding: "0",
              }}
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            width: "15%",
            justifyContent: "space-between",
          }}
          onClick={() => {
            tableHelpers.setTypeAscending(!tableHelpers.typeAscending);
            tableHelpers.sortByType();
          }}
        >
          <h5 style={{ padding: "0", margin: "0" }}>| Type: </h5>

          {tableHelpers.typeAscending ? (
            <NorthIcon
              style={{
                fontSize: "90%",
                alignSelf: "center",
                margin: "0",
                padding: "0",
              }}
            />
          ) : (
            <SouthIcon
              style={{
                fontSize: "90%",
                alignSelf: "center",
                margin: "0",
                padding: "0",
              }}
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            width: "15%",
            justifyContent: "space-between",
          }}
          onClick={() => {
            tableHelpers.setSizeAscending(!tableHelpers.sizeAscending);
            tableHelpers.sortBySize();
          }}
        >
          <h5 style={{ padding: "0", margin: "0" }}>| Size: </h5>

          {tableHelpers.sizeAscending ? (
            <NorthIcon
              style={{
                fontSize: "90%",
                alignSelf: "center",
                margin: "0",
                padding: "0",
              }}
            />
          ) : (
            <SouthIcon
              style={{
                fontSize: "90%",
                alignSelf: "center",
                margin: "0",
                padding: "0",
              }}
            />
          )}
        </div>
      </div>

      <List
        height={window.innerHeight * 0.6}
        width={"100%"}
        itemCount={FileList.length}
        itemSize={25}
        itemData={{ files: FileList }}
      >
        {rows}
      </List>
    </div>
  );
};

export default InfiniteList;
