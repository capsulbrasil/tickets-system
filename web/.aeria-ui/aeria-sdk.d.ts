import type {
  InferProperty,
  InferResponse,
  SchemaWithId,
  MakeEndpoint,
  RequestMethod,
  CollectionFunctionsSDK

} from '@aeriajs/types'

declare type MirrorDescriptions = {
  "comment": {
    "$id": "comment",
    "properties": {
      "ticket": {
        "$ref": "ticket",
        "indexes": [
          "title"
        ]
      },
      "description": {
        "type": "string",
        "element": "textarea"
      },
      "images": {
        "type": "array",
        "items": {
          "$ref": "file",
          "accept": [
            "image/*"
          ],
          "indexes": [
            "name",
            "link",
            "type"
          ]
        }
      },
      "owner": {
        "$ref": "user",
        "noForm": true,
        "indexes": [
          "name"
        ]
      },
      "created_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      }
    },
    "icon": "chat-text",
    "owned": "on-write",
    "required": [
      "description"
    ],
    "presets": [
      "crud"
    ],
    "actions": {
      "spawnAdd": {
        "label": "action.add",
        "event": "spawnAdd",
        "icon": "plus",
        "button": true,
        "translate": true
      }
    },
    "individualActions": {
      "spawnEdit": {
        "label": "action.edit",
        "event": "spawnEdit",
        "icon": "pencil-simple",
        "translate": true
      },
      "viewItem": {
        "label": "action.view",
        "icon": "eye",
        "translate": true,
        "route": {
          "name": "/dashboard/:collection/:id",
          "setItem": true
        }
      },
      "remove": {
        "label": "action.remove",
        "icon": "trash",
        "ask": true,
        "translate": true
      }
    }
  },
  "file": {
    "$id": "file",
    "icon": "paperclip",
    "owned": "always",
    "presets": [
      "owned"
    ],
    "indexes": [
      "name",
      "link",
      "type"
    ],
    "properties": {
      "type": {
        "type": "string"
      },
      "size": {
        "type": "number"
      },
      "last_modified": {
        "type": "string",
        "format": "date-time"
      },
      "name": {
        "type": "string"
      },
      "absolute_path": {
        "type": "string"
      },
      "relative_path": {
        "type": "string"
      },
      "immutable": {
        "type": "boolean"
      },
      "link": {
        "readOnly": true
      },
      "download_link": {
        "readOnly": true
      },
      "owner": {
        "$ref": "user",
        "noForm": true,
        "indexes": [
          "name"
        ]
      },
      "created_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      }
    },
    "actions": {
      "deleteAll": {
        "label": "Remover",
        "ask": true,
        "selection": true
      }
    },
    "individualActions": {
      "remove": {
        "label": "Remover",
        "icon": "trash",
        "ask": true
      }
    }
  },
  "tempFile": {
    "$id": "tempFile",
    "icon": "file",
    "hidden": true,
    "temporary": {
      "index": "created_at",
      "expireAfterSeconds": 3600
    },
    "properties": {
      "created_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      },
      "absolute_path": {
        "type": "string"
      },
      "size": {
        "type": "number"
      },
      "mime": {
        "type": "number"
      },
      "collection": {
        "type": "string"
      },
      "filename": {
        "type": "string"
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      }
    }
  },
  "ticket": {
    "$id": "ticket",
    "properties": {
      "title": {
        "type": "string"
      },
      "topic": {
        "$ref": "topic",
        "populate": [
          "images"
        ],
        "indexes": [
          "title"
        ]
      },
      "status": {
        "enum": [
          "Open",
          "Repairing",
          "Completed"
        ]
      },
      "priority": {
        "enum": [
          "Low",
          "Moderate",
          "Urgent"
        ]
      },
      "description": {
        "type": "string",
        "element": "textarea"
      },
      "attached": {
        "$ref": "file",
        "accept": [
          "image/*"
        ],
        "indexes": [
          "name",
          "link",
          "type"
        ]
      },
      "created_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      },
      "owner": {
        "$ref": "user",
        "populate": [
          "roles"
        ],
        "noForm": true,
        "indexes": [
          "name"
        ]
      },
      "comments": {
        "noForm": true,
        "readOnly": true
      }
    },
    "icon": "ticket",
    "owned": "on-write",
    "table": [
      "title",
      "topic",
      "status",
      "priority",
      "created_at"
    ],
    "required": [
      "title",
      "topic",
      "priority",
      "status",
      "description",
      "attached"
    ],
    "filters": [
      "title",
      "topic",
      "status",
      "priority"
    ],
    "presets": [
      "crud"
    ],
    "indexes": [
      "title"
    ],
    "freshItem": {
      "status": "Open"
    },
    "individualActions": {
      "viewContent": {
        "label": "Ver ticket",
        "icon": "magnifying-glass",
        "button": true
      },
      "spawnEdit": {
        "label": "action.edit",
        "event": "spawnEdit",
        "icon": "pencil-simple",
        "translate": true
      },
      "viewItem": {
        "label": "action.view",
        "icon": "eye",
        "translate": true,
        "route": {
          "name": "/dashboard/:collection/:id",
          "setItem": true
        }
      },
      "remove": {
        "label": "action.remove",
        "icon": "trash",
        "ask": true,
        "translate": true
      }
    },
    "tableLayout": {
      "actions": {
        "viewContent": {
          "button": true
        }
      }
    },
    "actions": {
      "spawnAdd": {
        "label": "action.add",
        "event": "spawnAdd",
        "icon": "plus",
        "button": true,
        "translate": true
      }
    }
  },
  "topic": {
    "$id": "topic",
    "properties": {
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string",
        "element": "textarea"
      },
      "images": {
        "type": "array",
        "items": {
          "$ref": "file",
          "accept": [
            "image/*"
          ],
          "indexes": [
            "name",
            "link",
            "type"
          ]
        }
      },
      "owner": {
        "$ref": "user",
        "noForm": true,
        "indexes": [
          "name"
        ]
      },
      "created_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      }
    },
    "icon": "text-align-left",
    "owned": "on-write",
    "table": [
      "title",
      "images"
    ],
    "required": [
      "title"
    ],
    "presets": [
      "crud"
    ],
    "actions": {
      "spawnAdd": {
        "label": "action.add",
        "event": "spawnAdd",
        "icon": "plus",
        "button": true,
        "translate": true
      }
    },
    "individualActions": {
      "spawnEdit": {
        "label": "action.edit",
        "event": "spawnEdit",
        "icon": "pencil-simple",
        "translate": true
      },
      "viewItem": {
        "label": "action.view",
        "icon": "eye",
        "translate": true,
        "route": {
          "name": "/dashboard/:collection/:id",
          "setItem": true
        }
      },
      "remove": {
        "label": "action.remove",
        "icon": "trash",
        "ask": true,
        "translate": true
      }
    }
  },
  "user": {
    "$id": "user",
    "icon": "users",
    "required": [
      "name",
      "roles",
      "email"
    ],
    "form": [
      "name",
      "active",
      "roles",
      "email",
      "phone_number",
      "picture_file"
    ],
    "indexes": [
      "name"
    ],
    "properties": {
      "name": {
        "type": "string"
      },
      "given_name": {
        "readOnly": true
      },
      "family_name": {
        "readOnly": true
      },
      "active": {
        "type": "boolean"
      },
      "roles": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "root",
            "logistic",
            "support",
            "commercial",
            "producer",
            "callcenter"
          ]
        },
        "uniqueItems": true
      },
      "email": {
        "type": "string",
        "inputType": "email",
        "unique": true
      },
      "password": {
        "type": "string",
        "inputType": "password",
        "hidden": true
      },
      "phone_number": {
        "type": "string",
        "mask": "(##) #####-####"
      },
      "picture_file": {
        "$ref": "file",
        "accept": [
          "image/*"
        ],
        "indexes": [
          "name",
          "link",
          "type"
        ]
      },
      "picture": {
        "readOnly": true
      },
      "group": {
        "type": "string"
      },
      "self_registered": {
        "type": "boolean",
        "readOnly": true
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      },
      "business": {
        "type": "string"
      },
      "created_at": {
        "type": "string",
        "format": "date-time",
        "noForm": true,
        "readOnly": true,
        "isTimestamp": true
      }
    },
    "presets": [
      "crud",
      "duplicate"
    ],
    "layout": {
      "name": "grid",
      "options": {
        "title": "name",
        "badge": "roles",
        "picture": "picture_file",
        "information": "email",
        "active": "active"
      }
    },
    "individualActions": {
      "changePassword": {
        "label": "change_password",
        "icon": "key",
        "translate": true,
        "route": {
          "name": "/dashboard/user/changepass",
          "fetchItem": true
        }
      },
      "copyActivationLink": {
        "label": "copy_activation_link",
        "icon": "link",
        "translate": true
      },
      "spawnEdit": {
        "label": "action.edit",
        "event": "spawnEdit",
        "icon": "pencil-simple",
        "translate": true
      },
      "viewItem": {
        "label": "action.view",
        "icon": "eye",
        "translate": true,
        "route": {
          "name": "/dashboard/:collection/:id",
          "setItem": true
        }
      },
      "remove": {
        "label": "action.remove",
        "icon": "trash",
        "ask": true,
        "translate": true
      },
      "duplicate": {
        "label": "action.duplicate",
        "event": "duplicate",
        "icon": "copy",
        "translate": true
      }
    },
    "filters": [
      "name",
      "roles",
      "email",
      "phone_number"
    ],
    "table": [
      "name",
      "roles",
      "picture_file",
      "active",
      "updated_at"
    ],
    "tableMeta": [
      "email"
    ],
    "formLayout": {
      "fields": {
        "given_name": {
          "span": 3
        },
        "family_name": {
          "span": 3
        }
      }
    },
    "actions": {
      "spawnAdd": {
        "label": "action.add",
        "event": "spawnAdd",
        "icon": "plus",
        "button": true,
        "translate": true
      }
    }
  }
}


declare type MirrorRouter = {
  "/comment/get": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/comment/getAll": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/comment/insert": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/comment/remove": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/comment/upload": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/file/get": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/file/insert": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/file/download": {
    "POST": {
      "roles": [
        "root"
      ]
    }
  },
  "/file/remove": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/file/removeAll": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/ticket/count": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/ticket/get": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/ticket/getAll": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/ticket/insert": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/ticket/upload": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/ticket/remove": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/topic/get": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/topic/getAll": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/topic/insert": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/topic/remove": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/topic/upload": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/user/get": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/user/getAll": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/user/remove": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/user/upload": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/user/removeFile": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/user/insert": {
    "POST": {
      "roles": [
        "root"
      ],
      "builtin": true
    }
  },
  "/user/authenticate": {
    "POST": {
      "roles": [
        "root"
      ]
    }
  },
  "/user/activate": {
    "POST": {
      "roles": [
        "root"
      ]
    }
  },
  "/user/createAccount": {
    "POST": {
      "roles": [
        "root"
      ]
    }
  },
  "/user/getInfo": {
    "POST": {
      "roles": [
        "root"
      ]
    }
  },
  "/user/getCurrentUser": {
    "POST": {
      "roles": [
        "root"
      ],
      "response": {
        "$ref": "user"
      }
    }
  },
  "/user/getActivationLink": {
    "POST": {
      "roles": [
        "root"
      ]
    }
  },
  "/ticket/countAll": {
    "GET": {
      "response": [
        {
          "type": "object",
          "properties": {
            "_tag": {
              "const": "Error"
            },
            "result": {},
            "error": {
              "type": "object",
              "required": [
                "httpStatus",
                "code"
              ],
              "properties": {
                "httpStatus": {
                  "enum": [
                    404,
                    500
                  ]
                },
                "code": {
                  "enum": [
                    "NO_TICKETS_FOUND",
                    "INTERNAL_SERVER_ERROR"
                  ]
                },
                "message": {
                  "type": "string"
                },
                "details": {
                  "type": "object",
                  "variable": true
                }
              }
            }
          }
        },
        {
          "type": "object",
          "properties": {
            "_tag": {
              "const": "Result"
            },
            "error": {},
            "result": {
              "type": "object",
              "properties": {
                "openTickets": {
                  "type": "number"
                },
                "repairingTickets": {
                  "type": "number"
                },
                "completedTickets": {
                  "type": "number"
                }
              }
            }
          }
        }
      ]
    }
  }
}


declare global {
  type Collections = {
    [K in keyof MirrorDescriptions]: {
      item: SchemaWithId<MirrorDescriptions[K]>
    }
  }
}

declare module 'aeria-sdk' {
  import { TopLevelObject } from 'aeria-sdk'

  type UnionToIntersection<T> = (T extends any ? ((x: T) => 0) : never) extends ((x: infer R) => 0)
    ? R
    : never

  type InferEndpoint<Route extends keyof MirrorRouter> = {
    [Method in keyof MirrorRouter[Route]]: Method extends RequestMethod
      ? MirrorRouter[Route][Method] extends infer Contract
        ? Contract extends
        | { response: infer RouteResponse }
        | { payload: infer RoutePayload  }
        | { query: infer RoutePayload  }
          ? MakeEndpoint<
            Route,
            Method,
            InferResponse<RouteResponse>,
            RoutePayload extends {}
              ? InferProperty<RoutePayload>
              : undefined
          >
          : MakeEndpoint<Route, Method>
        : never
      : never
    } extends infer Methods
      ? Methods[keyof Methods]
      : never

  type Endpoints = {
    [Route in keyof MirrorRouter]: Route extends `/${infer Coll}/${infer Fn}`
      ? Coll extends keyof Collections
        ? Fn extends keyof CollectionFunctionsSDK<any>
          ? Record<Coll, Record<
              Fn, {
              POST: CollectionFunctionsSDK<SchemaWithId<MirrorDescriptions[Coll]>>[Fn]
            }
            >>
          : InferEndpoint<Route>
        : InferEndpoint<Route>
      : InferEndpoint<Route>
  } extends infer Endpoints
    ? UnionToIntersection<Endpoints[keyof Endpoints]>
    : never

  type TopLevelAeria = 
    & ((bearerToken?: string) => TopLevelObject & Endpoints)
    & TopLevelObject & Endpoints

  const topLevelAeria: TopLevelAeria

  export const url: string
  export const aeria: TopLevelAeria
  export default topLevelAeria
}

