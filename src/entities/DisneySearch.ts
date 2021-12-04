export type DisneySearch = {
  data: {
    search: {
      hits: {
        hit: {
          family: {
            encodedFamilyId: string;
          };
          image: {
            tile: {
              "1.78": {
                video: {
                  default: {
                    url: string;
                  };
                };
              };
            };
          };
          text: {
            title: {
              full: {
                program: {
                  default: {
                    content: string;
                  };
                };
              };
            };
          };
        };
      }[];
    };
  };
};
